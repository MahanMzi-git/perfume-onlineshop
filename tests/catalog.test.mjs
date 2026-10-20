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
    module, exports: module.exports, document: testDocument,
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
  assert.deepEqual(ids({ noteIds: ['n-rose'], minPrice: 4500000 }), ['p1']);
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
