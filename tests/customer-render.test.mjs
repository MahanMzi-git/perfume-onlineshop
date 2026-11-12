import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

// Render the real customer surfaces without a browser or added test dependency.
// This catches missing contexts, broken component imports and invalid empty-state paths;
// it is not a substitute for browser interaction or responsive checks.
const require = createRequire(import.meta.url);
const root = path.resolve('src');
const cache = new Map();
function load(filename, react = React) {
  filename = path.resolve(filename);
  assert.ok(filename.startsWith(root + path.sep));
  if (cache.has(filename)) return cache.get(filename).exports;
  const module = { exports: {} }; cache.set(filename, module);
  const source = fs.readFileSync(filename, 'utf8').replaceAll('import.meta.env', JSON.stringify({ BASE_URL: '/perfume-onlineshop/' }));
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  });
  vm.runInNewContext(outputText, { module, exports: module.exports, URLSearchParams, console,
    require: specifier => {
      if (specifier === 'react') return react;
      if (!specifier.startsWith('.')) return require(specifier);
      const base = path.resolve(path.dirname(filename), specifier);
      const resolved = ['.ts', '.tsx'].map(ext => base + ext).find(file => fs.existsSync(file));
      assert.ok(resolved, `Missing module: ${specifier}`); return load(resolved);
    },
  }, { filename });
  return module.exports;
}
const { StoreContext } = load(path.join(root, 'components/StoreContext.tsx'));
const { CustomerProvider } = load(path.join(root, 'components/CustomerContext.tsx'));
const { CustomerPage, accountTabs } = load(path.join(root, 'pages/CustomerPages.tsx'));
const { CartPage, CheckoutPage } = load(path.join(root, 'pages/ShoppingPages.tsx'));
const { products } = load(path.join(root, 'data/products.ts'));
const { CatalogPage } = load(path.join(root, 'pages/CatalogPage.tsx'));
const { ComparisonPage } = load(path.join(root, 'pages/ComparisonPage.tsx'), {
  ...React,
  // Static rendering cannot click the scent tab, so start that component on it.
  useState(initial) { return React.useState(initial === 'purchase' ? 'scent' : initial); },
});
const noop = () => {};
test('Catalog pagination fills the approved five-column row and keeps all products reachable',()=>{
 const first=render(CatalogPage,{params:new URLSearchParams()}),second=render(CatalogPage,{params:new URLSearchParams('page=2')});
 assert.equal((first.match(/<article class="card /g)??[]).length,5);
 assert.equal((second.match(/<article class="card /g)??[]).length,4);
 for(const product of products)assert.ok((first+second).includes('جزئیات عطر '+product.name));
});
test('An inherently empty collection offers catalog navigation instead of an inert reset',()=>{
 const {collections}=load(path.join(root,'data/collections.ts'));
 const html=render(CatalogPage,{params:new URLSearchParams(),collection:collections.find(c=>c.slug==='gifts'),baseHref:'#/collections/gifts'});
 assert.ok(html.includes('این مجموعه فعلاً محصول نمایشی ندارد.'));assert.ok(html.includes('دیدن همهٔ عطرها'));assert.ok(!html.includes('پاک کردن همهٔ فیلترها'));
});
test('Real fragrance comparisons label selected notes without inventing a note pyramid',()=>{
 const html=render(ComparisonPage,{ids:products.slice(0,2).map(p=>p.id)});
 assert.ok(html.includes('نت‌های منتخب'));assert.ok(!html.includes('نت‌های آغازین'));assert.ok(!html.includes('نت‌های پایه'));
});
function render(Component, props = {}, bagLines = [], favourites = []) {
  const store = { favourites, toggleFavourite: noop, comparisonIds: [], toggleComparison: noop, addToBag: noop, bagLines, changeBag: noop, removeBag: noop, discountCode: '', setDiscountCode: noop };
  return renderToStaticMarkup(React.createElement(StoreContext.Provider, { value: store }, React.createElement(CustomerProvider, null, React.createElement(Component, props))));
}
test('All account pages render without authentication or browser storage, including empty and populated wishlist', () => {
  for (const tab of accountTabs) {
    const html = render(CustomerPage, { section: tab.id });
    assert.ok(html.includes('حساب آزمایشی است'), tab.id);
    assert.ok(html.includes('<h1>'), tab.id);
    assert.ok(!html.includes('type="password"'), tab.id);
  }
  assert.ok(render(CustomerPage, { section: 'wishlist' }, [], [products[0].id]).includes(products[0].name));
  assert.ok(render(CustomerPage, { section: 'orders', orderId: 'DEMO-1001' }).includes('دادهٔ کاملاً ساختگی'));
  assert.ok(render(CustomerPage, { section: 'orders', orderId: 'missing' }).includes('سفارش نمایشی پیدا نشد'));
});
test('Cart and checkout render empty, valid and missing-variant states without crashing', () => {
  assert.ok(render(CartPage).includes('سبد شما هنوز خالی است'));
  assert.ok(render(CheckoutPage).includes('ابتدا عطری به سبد اضافه کنید'));
  const line = { productId: products[0].id, variantId: products[0].variants[0].id, quantity: 1 };
  assert.ok(render(CartPage, {}, [line]).includes(products[0].name));
  assert.ok(render(CheckoutPage, {}, [line]).includes('نام گیرنده'));
  const invalid = { ...line, variantId: 'missing' };
  assert.ok(render(CartPage, {}, [invalid]).includes('حذف قلم نامعتبر'));
  assert.ok(render(CheckoutPage, {}, [invalid]).includes('سبد نیاز به اصلاح دارد'));
});


test('Independent menu pages resolve and collection scope survives conflicting URL filters', () => {
  const { parseRoute } = load(path.join(root, 'lib/routes.ts'));
  const { collections } = load(path.join(root, 'data/collections.ts'));
  const { CatalogPage } = load(path.join(root, 'pages/CatalogPage.tsx'));
  for (const page of ['about', 'contact', 'brands', 'journal', 'form-studio']) assert.equal(parseRoute('#/' + page).page, page);
  assert.equal(parseRoute('#/collections/men').page, 'collection');
  const collection = collections.find(item => item.slug === 'men');
  const html = render(CatalogPage, { collection, baseHref: '#/collections/men', params: new URLSearchParams('audience=women') });
  assert.ok(html.includes('عطرهای مردانه'));
  assert.ok(html.includes('Sauvage'));
  assert.ok(!html.includes('Coco Mademoiselle'));
});

test('Order tracking distinguishes preparation, delivery and cancellation without creating orders', () => {
  const pending = render(CustomerPage, { section: 'orders', orderId: 'DEMO-1001' });
  const delivered = render(CustomerPage, { section: 'orders', orderId: 'DEMO-1002' });
  assert.ok(pending.includes('aria-current="step"'));
  assert.ok(pending.includes('بسته‌بندی'));
  assert.equal((delivered.match(/data-state="complete"/g) ?? []).length, 5);
  assert.ok(delivered.includes('دادهٔ کاملاً ساختگی'));
});


test('Review eligibility rejects visitors, unpurchased, preparing and cancelled orders', () => {
  const { canReviewDemoProduct, validReviewDraft } = load(path.join(root, 'lib/reviewEligibility.ts'));
  const { demoOrders } = load(path.join(root, 'data/demoOrders.ts'));
  const delivered = demoOrders.find(order => order.stage === 'delivered');
  const preparing = demoOrders.find(order => order.stage === 'packing');
  assert.equal(canReviewDemoProduct({showDemoOrders:false,cancelled:[]},delivered.productId),false);
  assert.equal(canReviewDemoProduct({showDemoOrders:true,cancelled:[]},preparing.productId),false);
  assert.equal(canReviewDemoProduct({showDemoOrders:true,cancelled:[]},'missing'),false);
  assert.equal(canReviewDemoProduct({showDemoOrders:true,cancelled:[delivered.id]},delivered.productId),false);
  assert.equal(canReviewDemoProduct({showDemoOrders:true,cancelled:[]},delivered.productId),true);
  for (const score of [0,6,2.5,NaN]) assert.equal(validReviewDraft(score,'A long demo review'),false);
  assert.equal(validReviewDraft(4,'short'),false);
  assert.equal(validReviewDraft(4,'x'.repeat(501)),false);
  assert.equal(validReviewDraft(4,'A long demo review'),true);
});

test('All real-product previews have consistent sample ratings and a gated review form', () => {
  const { ProductDetailPage } = load(path.join(root, 'pages/ProductDetailPage.tsx'));
  for (const product of products) {
    assert.ok(product.reviews.length >= 2);
    const html = render(ProductDetailPage,{product,params:new URLSearchParams()});
    assert.ok(html.includes('امتیاز نمایشی'));
    assert.ok(html.includes('دیدگاه مخصوص خریداران'));
    assert.ok(!html.includes('ذخیرهٔ دیدگاه نمایشی'));
    assert.ok(html.includes('compare-symbol'));
  }
});

const { ProductDetailApiContent } = load(path.join(root, 'pages/ProductDetailApiPage.tsx'));
test('API product detail renders loading, missing, failure and empty variant states', () => {
  const view = state => renderToStaticMarkup(React.createElement(ProductDetailApiContent, {state}));
  assert.match(view({kind: 'loading'}), /در حال دریافت/);
  assert.match(view({kind: 'missing'}), /محصول پیدا نشد/);
  assert.match(view({kind: 'error'}), /role="alert"/);
  assert.match(view({kind: 'ready', product: {name: 'API Perfume', variants: []}}), /نسخه‌ای برای نمایش/);
});

const { PerfumeWardrobe } = load(path.join(root, 'components/PerfumeWardrobe.tsx'));
const { buildWardrobe } = load(path.join(root, 'data/wardrobePerfumes.ts'));
const { getWardrobePage, getShelfPosition, getBottleScale } = load(path.join(root, 'lib/wardrobeLayout.ts'));

function wardrobeCatalog(count) {
  return Array.from({ length: count }, (_, index) => ({
    ...products[0], id: String(index + 1), slug: 'fixture-' + (index + 1), name: 'Fixture ' + (index + 1),
  }));
}

test('Wardrobe pagination renders up to sixteen products and centers incomplete shelves', () => {
  for (const count of [1, 4, 5, 16, 17, 32]) {
    const perfumes = buildWardrobe(wardrobeCatalog(count));
    const { pageCount } = getWardrobePage(perfumes, 0);
    assert.equal(pageCount, Math.ceil(count / 16));
    const html = render(PerfumeWardrobe, { perfumes });
    assert.equal((html.match(/class="wardrobe-slot"/g) ?? []).length, Math.min(16, count));
    assert.equal(html.includes('class="wardrobe-pagination"'), count > 16);
    if (count > 16) assert.match(html, /<button type="button" disabled=""><svg/);

    const orderedIds = [];
    for (let page = 0; page < pageCount; page++) {
      const visible = getWardrobePage(perfumes, page).perfumes;
      orderedIds.push(...visible.map(perfume => perfume.id));
      const rows = new Map();
      visible.forEach((_, index) => {
        const { left, top } = getShelfPosition(index, visible.length);
        rows.set(top, [...(rows.get(top) ?? []), left]);
      });
      assert.ok(rows.size <= 4);
      for (const columns of rows.values()) {
        assert.ok(columns.length <= 4);
        assert.equal(columns[0] + columns.at(-1), 100);
      }
    }
    assert.deepEqual(orderedIds, wardrobeCatalog(count).map(product => product.id));
  }
});

test('Removing and adding published perfumes updates the last page without stale entries', () => {
  const initial = wardrobeCatalog(18);
  const withoutOne = initial.filter(product => product.id !== '17');
  assert.equal(getWardrobePage(buildWardrobe(withoutOne), 1).perfumes[0].id, '18');
  const withoutSecondPage = withoutOne.filter(product => product.id !== '18');
  assert.equal(getWardrobePage(buildWardrobe(withoutSecondPage), 1).page, 0);
  assert.equal(getWardrobePage(buildWardrobe([...withoutSecondPage, initial.at(-1)]), 1).pageCount, 2);
  const duplicate = [...initial, initial[0], { ...initial[0], id: 'gift', productType: 'gift-set' }];
  assert.equal(buildWardrobe(duplicate).length, initial.length);
});

test('Bottle sizing defaults to one scale and responds to the volume supplied by the catalog', () => {
  const [base] = wardrobeCatalog(1);
  const [unknown, small, large] = buildWardrobe([
    base,
    { ...base, id: 'small', cabinetVolumeMl: 50 },
    { ...base, id: 'large', cabinetVolumeMl: 100 },
  ]);
  assert.equal(getBottleScale(unknown.volumeMl), 1);
  assert.ok(getBottleScale(small.volumeMl) < getBottleScale(large.volumeMl));
  assert.equal(getBottleScale(large.volumeMl), 1);
  assert.equal(getBottleScale(Infinity), 1);
  assert.equal(getBottleScale(1), getBottleScale(0.01));
  assert.equal(getBottleScale(1000), getBottleScale(10000));
});
