import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { test } from 'node:test';
import ts from 'typescript';

const root = path.resolve('src'), cache = new Map();
function load(relative) {
  const filename = path.resolve(root, relative);
  assert.ok(filename.startsWith(root + path.sep));
  if (cache.has(filename)) return cache.get(filename).exports;
  const module = { exports: {} }; cache.set(filename, module);
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
  vm.runInNewContext(outputText, { module, exports: module.exports, require: value => {
    assert.ok(value.startsWith('.'));
    return load(path.relative(root, path.resolve(path.dirname(filename), value + '.ts')));
  } }, { filename });
  return module.exports;
}
const { createAdminState } = load('admin/model.ts');
const { NEW_BRAND_OPTION, NEW_FAMILY_OPTION, validateProductDraft, saveProductDraft } = load('admin/productSave.ts');
const ids = { product: 'QA-PRODUCT', brand: 'QA-BRAND', variant: 'QA-VARIANT' };
const draft = state => ({ name: 'عطر آزمایشی تازه', brand: NEW_BRAND_OPTION, newBrand: '  Maison   QA  ', newBrandDetail: ' توضیح ساختگی ', family: state.records.families[0].name, notes: 'یاس، مشک', status: 'پیش‌نویس' });

test('Product and new brand save atomically without changing the source state', () => {
  const state = createAdminState(), snapshot = JSON.stringify(state);
  const next = saveProductDraft(state, draft(state), ids);
  assert.equal(next.products.length, state.products.length + 1);
  assert.equal(next.records.brands.length, state.records.brands.length + 1);
  assert.equal(next.products[0].brand, 'Maison QA');
  assert.equal(next.records.brands[0].name, 'Maison QA');
  assert.equal(next.records.brands[0].detail, 'توضیح ساختگی');
  assert.equal(next.records.brands[0].status, 'فعال');
  assert.equal(next.products[0].variants[0].stock, 0);
  assert.equal(next.products[0].variants[0].volume, 50);
  assert.equal(JSON.stringify(state), snapshot);
  assert.equal(next.records.families, state.records.families);
  assert.equal(next.orders, state.orders);
});

test('Invalid or stale product drafts cannot leave orphan brands', () => {
  const state = createAdminState();
  for (const patch of [{ name: '' }, { newBrand: '' }, { newBrand: 'x' }, { newBrand: 'x'.repeat(181) }, { family: '' }, { family: 'MISSING' }, { notes: '' }, { status: '' }, { brand: 'MISSING' }]) {
    assert.equal(saveProductDraft(state, { ...draft(state), ...patch }, ids), state);
  }
  assert.equal(saveProductDraft(state, draft(state), ids, 'MISSING'), state);
  assert.ok(validateProductDraft({ ...draft(state), newBrand: '' }).newBrand);
  assert.equal(validateProductDraft({ ...draft(state), newBrand: '' }).brand, undefined);
});

test('Equivalent existing brand names reuse the canonical record and preserve its metadata', () => {
  const state = createAdminState();
  const canonical = { id: 'PERSIAN-BRAND', name: 'کیان عطر', detail: 'شرح اصلی', status: 'پیش‌نویس', value: 'اصل' };
  state.records.brands.push(canonical);
  for (const name of ['كيان‌عطر', '  کیان   عطر  ']) {
    const next = saveProductDraft(state, { ...draft(state), newBrand: name, newBrandDetail: 'جایگزین نشود' }, ids);
    assert.equal(next.records, state.records);
    assert.equal(next.products[0].brand, canonical.name);
    assert.equal(next.records.brands.find(record => record.id === canonical.id), canonical);
  }
  const brand = state.records.brands[0];
  const next = saveProductDraft(state, { ...draft(state), newBrand: brand.name.toUpperCase() }, ids);
  assert.equal(next.records.brands.length, state.records.brands.length);
  assert.equal(next.products[0].brand, brand.name);
  const distinct = saveProductDraft(state, { ...draft(state), newBrand: 'کیانعطر' }, ids);
  assert.equal(distinct.records.brands.length, state.records.brands.length + 1);
  assert.equal(distinct.products[0].brand, 'کیانعطر');
});

test('Editing with a new brand preserves the existing product image, variants and unrelated rows', () => {
  const state = createAdminState(), existing = state.products[0];
  const next = saveProductDraft(state, draft(state), ids, existing.id);
  assert.equal(next.products.length, state.products.length);
  assert.equal(next.products[0].id, existing.id);
  assert.equal(next.products[0].image, existing.image);
  assert.equal(next.products[0].variants, existing.variants);
  assert.equal(next.products[1], state.products[1]);
  assert.equal(existing.brand, state.products[0].brand);
  assert.equal(next.records.brands[0].name, 'Maison QA');
});

test('Selecting a saved brand creates only the product and ignores hidden new-brand input', () => {
  const state = createAdminState(), brand = state.records.brands[0];
  const next = saveProductDraft(state, { ...draft(state), brand: brand.name, newBrand: '', newBrandDetail: '' }, ids);
  assert.equal(next.products[0].brand, brand.name);
  assert.equal(next.records, state.records);
  assert.equal(next.records.brands.length, state.records.brands.length);
});

test('New product, brand and fragrance family save together without mutating the original libraries', () => {
  const state = createAdminState(), snapshot = JSON.stringify(state);
  const values = { ...draft(state), family: NEW_FAMILY_OPTION, newFamily: '  رایحه   تازه  ', newFamilyDetail: ' توضیح خانواده ' };
  const next = saveProductDraft(state, values, { ...ids, family: 'QA-FAMILY' });
  assert.equal(next.products[0].brand, 'Maison QA');
  assert.equal(next.products[0].family, 'رایحه تازه');
  assert.equal(next.records.brands.length, state.records.brands.length + 1);
  assert.equal(next.records.families.length, state.records.families.length + 1);
  assert.equal(next.records.families[0].name, 'رایحه تازه');
  assert.equal(next.records.families[0].detail, 'توضیح خانواده');
  assert.equal(next.records.families[0].status, 'فعال');
  assert.equal(next.records.notes, state.records.notes);
  assert.equal(JSON.stringify(state), snapshot);
});

test('Invalid new families or missing/colliding IDs leave no orphan product, brand or family', () => {
  const state = createAdminState();
  const values = { ...draft(state), family: NEW_FAMILY_OPTION, newFamily: 'خانواده تازه' };
  for (const newFamily of ['', 'x', 'x'.repeat(181)]) {
    assert.equal(saveProductDraft(state, { ...values, newFamily }, { ...ids, family: 'QA-FAMILY' }), state);
  }
  assert.equal(saveProductDraft(state, values, ids), state);
  assert.equal(saveProductDraft(state, values, { ...ids, family: state.records.families[0].id }), state);
  assert.equal(saveProductDraft(state, values, { ...ids, brand: state.records.brands[0].id, family: 'QA-FAMILY' }), state);
  assert.equal(saveProductDraft(state, { ...values, notes: '' }, { ...ids, family: 'QA-FAMILY' }), state);
  const errors = validateProductDraft({ ...values, newFamily: '' });
  assert.ok(errors.newFamily);
  assert.equal(errors.family, undefined);
});

test('Equivalent family names reuse the canonical family without overwriting its metadata', () => {
  const state = createAdminState();
  const canonical = { id: 'PERSIAN-FAMILY', name: 'کیان رایحه', detail: 'شرح اصلی', status: 'پیش‌نویس', value: 'اصل' };
  const english = { id: 'ENGLISH-FAMILY', name: 'Woody QA', detail: 'original', status: 'فعال', value: '' };
  state.records.families.push(canonical, english);
  for (const [name, expected] of [['كيان‌رایحه', canonical], ['  کیان   رایحه  ', canonical], ['WOODY QA', english]]) {
    const values = { ...draft(state), brand: state.records.brands[0].name, family: NEW_FAMILY_OPTION, newFamily: name, newFamilyDetail: 'جایگزین نشود' };
    const next = saveProductDraft(state, values, ids);
    assert.equal(next.records, state.records);
    assert.equal(next.products[0].family, expected.name);
    assert.equal(next.records.families.find(record => record.id === expected.id), expected);
  }
  const distinct = saveProductDraft(state, { ...draft(state), brand: state.records.brands[0].name, family: NEW_FAMILY_OPTION, newFamily: 'کیانرایحه' }, { ...ids, family: 'QA-FAMILY' });
  assert.equal(distinct.records.families.length, state.records.families.length + 1);
});

test('Editing a product with a new family preserves its image, variants and other products', () => {
  const state = createAdminState(), existing = state.products[0];
  const values = { ...draft(state), brand: existing.brand, family: NEW_FAMILY_OPTION, newFamily: 'خانواده تازه' };
  const next = saveProductDraft(state, values, { ...ids, family: 'QA-FAMILY' }, existing.id);
  assert.equal(next.products.length, state.products.length);
  assert.equal(next.products[0].id, existing.id);
  assert.equal(next.products[0].family, 'خانواده تازه');
  assert.equal(next.products[0].variants, existing.variants);
  assert.equal(next.products[0].image, existing.image);
  assert.equal(next.products[1], state.products[1]);
  assert.equal(next.records.brands, state.records.brands);
  assert.equal(state.products[0], existing);
});

test('Selecting a saved family ignores invalid hidden new-family fields and needs no new family ID', () => {
  const state = createAdminState(), family = state.records.families[0];
  const values = { ...draft(state), brand: state.records.brands[0].name, family: family.name, newFamily: 'x', newFamilyDetail: 'ثبت نشود' };
  const next = saveProductDraft(state, values, ids);
  assert.equal(next.products[0].family, family.name);
  assert.equal(next.records, state.records);
  assert.equal(next.records.families.length, state.records.families.length);
});

test('Audience and selected note limits are validated and saved with the product',()=>{
 const state=createAdminState();
 assert.equal(saveProductDraft(state,{...draft(state),audience:'invalid'},ids),state);
 assert.equal(saveProductDraft(state,{...draft(state),notes:'رز، یاس، مشک، وانیل، سدر'},ids),state);
 const next=saveProductDraft(state,{...draft(state),audience:'زنانه',notes:'رز، یاس، مشک، وانیل'},ids);
 assert.equal(next.products[0].audience,'زنانه');
 assert.equal(next.products[0].notes,'رز، یاس، مشک، وانیل');
});

test('Product usage selections save independently and reject unknown options',()=>{
 const state=createAdminState(),values={...draft(state),seasons:'بهار، پاییز',occasions:'محیط کار، قرار عاشقانه',dayTimes:'صبح، شب'};
 const next=saveProductDraft(state,values,ids);
 assert.equal(JSON.stringify(next.products[0].seasons),JSON.stringify(['بهار','پاییز']));
 assert.equal(JSON.stringify(next.products[0].occasions),JSON.stringify(['محیط کار','قرار عاشقانه']));
 assert.equal(JSON.stringify(next.products[0].dayTimes),JSON.stringify(['صبح','شب']));
 assert.equal(saveProductDraft(state,{...values,seasons:'ناشناخته'},ids),state);
});
