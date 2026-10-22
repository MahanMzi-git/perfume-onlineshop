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
function load(filename) {
  filename = path.resolve(filename);
  assert.ok(filename.startsWith(root + path.sep));
  if (cache.has(filename)) return cache.get(filename).exports;
  const module = { exports: {} }; cache.set(filename, module);
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  });
  vm.runInNewContext(outputText, { module, exports: module.exports, URLSearchParams, console,
    require: specifier => {
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
const noop = () => {};
function render(Component, props = {}, bagLines = [], favourites = []) {
  const store = { favourites, toggleFavourite: noop, comparisonIds: [], toggleComparison: noop, addToBag: noop, bagLines, changeBag: noop, removeBag: noop, discountCode: '', setDiscountCode: noop };
  return renderToStaticMarkup(React.createElement(StoreContext.Provider, { value: store }, React.createElement(CustomerProvider, null, React.createElement(Component, props))));
}
test('All account pages render without authentication or browser storage, including empty and populated wishlist', () => {
  for (const tab of accountTabs) {
    const html = render(CustomerPage, { section: tab.id });
    assert.ok(html.includes('نسخهٔ نمایشی بدون ورود'), tab.id);
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
