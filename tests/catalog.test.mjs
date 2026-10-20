import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { test } from 'node:test';
import ts from 'typescript';

// Compile only the existing pure TypeScript catalog modules in memory.
// No browser, additional test dependency, or generated project files are needed.
const root = path.resolve('src');
const cache = new Map();
const testDocument = { activeElement: null };
function load(relativePath) {
  const filename = path.resolve(root, relativePath);
  assert.ok(filename.startsWith(root + path.sep));
  if (cache.has(filename)) return cache.get(filename).exports;
  const module = { exports: {} };
  cache.set(filename, module);
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  vm.runInNewContext(outputText, {
    module, exports: module.exports, document: testDocument, URLSearchParams,
    require: specifier => {
      assert.ok(specifier.startsWith('.'), 'Only local catalog modules are allowed');
      return load(path.relative(root, path.resolve(path.dirname(filename), specifier + '.ts')));
    },
  }, { filename });
  return module.exports;
}
const { filterProducts } = load('lib/filter.ts');
const { products } = load('data/products.ts');
const ids = filters => Array.from(filterProducts(products, { query: '', ...filters }), p => p.id);

test('Persian search accepts Arabic yeh and kaf, accents and tashkeel', () => {
  assert.deepEqual(ids({ query: 'ليمُو' }), ['p7']);
  assert.deepEqual(ids({ query: 'مشك' }), ['p1', 'p5']);
  assert.deepEqual(ids({ query: '  SANTAL creme  ' }), ['p5']);
});
test('Search matches brand and scent-note names', () => {
  assert.deepEqual(ids({ query: 'maison' }), ['p1', 'p7']);
  assert.deepEqual(ids({ query: 'گل رز' }), ['p1', 'p6']);
});
test('Filters compose and reset without changing source data', () => {
  assert.deepEqual(ids({ audience: 'women', brandId: 'b-velora' }), ['p6']);
  assert.deepEqual(ids({ familyId: 'f-woody', giftSet: true }), ['p3', 'p5']);
  assert.deepEqual(ids({ noteIds: ['n-rose'], minPrice: 4500000, maxPrice: 5000000 }), ['p1']);
  assert.deepEqual(ids({ query: 'not-a-perfume' }), []);
  assert.equal(ids({}).length, 8);
  assert.equal(products.length, 8);
});

const { containDialogFocus } = load('lib/dialogFocus.ts');
test('Dialog keyboard navigation wraps in both directions and handles dialog focus', () => {
  const first = { getClientRects: () => [1], focus: () => { testDocument.activeElement = first; } };
  const last = { getClientRects: () => [1], focus: () => { testDocument.activeElement = last; } };
  const dialog = { querySelectorAll: () => [first, last] };
  let prevented = false;
  const event = shiftKey => ({ key: 'Tab', shiftKey, currentTarget: dialog, preventDefault: () => { prevented = true; } });
  testDocument.activeElement = first;
  containDialogFocus(event(true));
  assert.equal(testDocument.activeElement, last);
  assert.equal(prevented, true);
  containDialogFocus(event(false));
  assert.equal(testDocument.activeElement, first);
  testDocument.activeElement = dialog;
  containDialogFocus(event(true));
  assert.equal(testDocument.activeElement, last);
});

test('Multiple notes use AND matching, compose with other filters and support removal/reset', () => {
  assert.deepEqual(ids({ noteIds: ['n-vanilla', 'n-amber', 'n-pepper'] }), ['p2']);
  assert.deepEqual(ids({ noteIds: ['n-amber', 'n-pepper'] }), ['p2', 'p8']);
  assert.deepEqual(ids({ noteIds: ['n-vanilla', 'n-amber', 'n-pepper'], audience: 'men' }), []);
  assert.deepEqual(ids({ noteIds: ['n-vanilla', 'n-rose'] }), []);
  assert.deepEqual(ids({ noteIds: [] }), ids({}));
  assert.deepEqual(ids({ noteIds: ['n-amber', 'n-amber'] }), ids({ noteIds: ['n-amber'] }));
});

const { matchingVariant, sortProducts, demoRating, addComparison } = load('lib/catalog.ts');
const { parseRoute, filtersFromParams, catalogHref } = load('lib/routes.ts');
const { scentNotes } = load('data/scentNotes.ts');
const { fragranceFamilies } = load('data/fragranceFamilies.ts');

test('All catalog references and variant prices are internally consistent', () => {
  const notes = new Set(scentNotes.map(note => note.id));
  const families = new Set(fragranceFamilies.map(family => family.id));
  const variantIds = new Set();
  for (const product of products) {
    assert.equal(product.price, product.variants[0].price);
    assert.equal(product.concentration, product.variants[0].concentration);
    const pyramid = [...product.notePyramid.top, ...product.notePyramid.middle, ...product.notePyramid.base];
    assert.deepEqual([...new Set(pyramid)].sort(), [...product.scentNoteIds].sort());
    product.scentNoteIds.forEach(id => assert.ok(notes.has(id), id));
    product.fragranceFamilyIds.forEach(id => assert.ok(families.has(id), id));
    for (const variant of product.variants) {
      assert.ok(!variantIds.has(variant.id)); variantIds.add(variant.id);
      assert.ok(variant.price > 0 && variant.volumeMl > 0 && Number.isInteger(variant.stock) && variant.stock >= 0);
      if (variant.compareAtPrice) assert.ok(variant.compareAtPrice > variant.price);
    }
  }
});
test('Volume, concentration, price and stock must match the same variant', () => {
  const rose = products.find(p => p.id === 'p1');
  assert.equal(matchingVariant(rose, { query: '', volumeMl: 100, maxPrice: 5000000 }), undefined);
  assert.equal(matchingVariant(rose, { query: '', volumeMl: 100, concentration: 'EDT' }), undefined);
  assert.equal(matchingVariant(rose, { query: '', volumeMl: 50, concentration: 'EDT' }).price, 3900000);
  assert.deepEqual(ids({ volumeMl: 100, stock: 'out-of-stock', noteIds: ['n-vanilla', 'n-pepper'] }), ['p2']);
  assert.deepEqual(ids({ temperature: 'cool', sweetness: 'dry', season: 'summer', occasion: 'work', productType: 'perfume' }), ['p4', 'p7']);
});
test('Sort order uses matching-variant price, demo scores and dates without mutating source', () => {
  const before = products.map(p => p.id).join(',');
  const sorted = sortProducts(products, 'price-asc', { query: '' });
  assert.equal(sorted[0].id, 'p7');
  assert.equal(sortProducts(products, 'price-desc', { query: '' })[0].id, 'p2');
  assert.equal(sortProducts(products, 'newest', { query: '' })[0].id, 'p8');
  const byRating = sortProducts(products, 'rating', { query: '' });
  assert.equal(byRating.at(-1).id, 'p7');
  assert.equal(demoRating(products.find(p => p.id === 'p7')), undefined);
  assert.equal(products.map(p => p.id).join(','), before);
});
test('Comparison supports remove, limits to three and rejects a fourth selection', () => {
  let selection = addComparison([], 'p1').ids;
  selection = addComparison(selection, 'p2').ids;
  selection = addComparison(selection, 'p3').ids;
  assert.equal(addComparison(selection, 'p4').limitReached, true);
  assert.equal(addComparison(selection, 'p4').ids.length, 3);
  assert.deepEqual(Array.from(addComparison(selection, 'p2').ids), ['p1', 'p3']);
});
test('Catalog links round-trip filters and reject malformed numeric and enum parameters', () => {
  const href = catalogHref({ query: 'گل رز', noteIds: ['n-rose', 'n-musk'], volumeMl: 50, stock: 'in-stock' }, { sort: 'price-asc', page: 2 });
  const route = parseRoute(href);
  assert.equal(route.page, 'catalog');
  const decoded = filtersFromParams(route.params);
  assert.equal(decoded.query, 'گل رز');
  assert.deepEqual(Array.from(decoded.noteIds), ['n-rose', 'n-musk']);
  assert.equal(decoded.volumeMl, 50);
  assert.equal(decoded.stock, 'in-stock');
  const invalid = filtersFromParams(new URLSearchParams('minPrice=Infinity&volumeMl=-5&audience=wrong&stock=wrong'));
  assert.equal(invalid.minPrice, undefined); assert.equal(invalid.volumeMl, undefined);
  assert.equal(invalid.audience, undefined); assert.equal(invalid.stock, undefined);
  assert.equal(parseRoute('#products').page, 'home');
  assert.equal(parseRoute('#/product/rose-voile').page, 'product');
  assert.equal(parseRoute('#/unknown/path').page, 'not-found');
});

const { addDemoBagItem } = load('lib/demoBag.ts');
test('Demo bag does not exceed simulated stock or accept unknown variant IDs', () => {
  const product = products.find(p => p.id === 'p1');
  let lines = [];
  for (let i = 0; i < 4; i++) lines = addDemoBagItem(lines, product, 'p1-50-EDT').lines;
  assert.equal(lines[0].quantity, 2);
  const out = products.find(p => p.id === 'p2');
  assert.equal(addDemoBagItem([], out, 'p2-100-Extrait').lines.length, 0);
  assert.equal(addDemoBagItem([], product, 'missing').lines.length, 0);
});
