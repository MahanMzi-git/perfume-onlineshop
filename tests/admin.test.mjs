import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {test} from 'node:test';
import ts from 'typescript';
const root=path.resolve('src'),cache=new Map();
function load(relative){const filename=path.resolve(root,relative);assert.ok(filename.startsWith(root+path.sep));if(cache.has(filename))return cache.get(filename).exports;const module={exports:{}};cache.set(filename,module);const {outputText}=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}});vm.runInNewContext(outputText,{module,exports:module.exports,URLSearchParams,require:s=>{assert.ok(s.startsWith('.'));return load(path.relative(root,path.resolve(path.dirname(filename),s+'.ts')));}},{filename});return module.exports;}
const m=load('admin/model.ts'),{parseRoute}=load('lib/routes.ts'),{products}=load('data/products.ts');
test('Only seller administrative routes remain; platform paths resolve to not-found',()=>{
 for(const [section] of m.sellerPages){const route=parseRoute(`#/seller/${section}`);assert.equal(route.page,'seller');assert.equal(route.admin.section,section);}
 assert.equal(parseRoute('#/seller/products/missing').admin.id,'missing');assert.equal(parseRoute('#/seller/orders/DEMO-1001').admin.section,'order-detail');
 for(const path of ['#/platform','#/platform/users','#/platform/maintenance']){assert.equal(parseRoute(path).page,'not-found');assert.equal(parseRoute(path).admin,undefined);}
 assert.equal(parseRoute('#/account/profile').admin,undefined);
 const state=m.createAdminState();assert.equal(state.records.users,undefined);assert.equal(state.records.features,undefined);assert.equal(state.settings.maintenance,undefined);assert.equal(m.roles.platform,undefined);
});
test('Seller mock access denies visitors and removed roles and makes analyst read-only',()=>{
 assert.equal(m.canAccess('visitor','seller'),false);assert.equal(m.canEdit('visitor','seller'),false);
 assert.equal(m.canAccess('platform','seller'),false);assert.equal(m.canAccess('seller','platform'),false);
 assert.equal(m.canAccess('analyst','seller'),true);assert.equal(m.canEdit('analyst','seller'),false);assert.equal(m.canEdit('seller','seller'),true);
});
test('Admin inventory changes never mutate storefront fixtures or other session snapshots',()=>{
 const original=JSON.stringify(products),a=m.createAdminState(),b=m.createAdminState(),p=a.products[0],v=p.variants[0];
 const changed=m.updateVariant(a,p.id,v.id,{stock:0,price:123456,volume:17});assert.equal(changed.products[0].variants[0].stock,0);assert.equal(changed.products[0].variants[0].price,123456);
 assert.equal(JSON.stringify(products),original);assert.equal(JSON.stringify(a),JSON.stringify(b));
 for(const patch of [{stock:-1},{stock:1.2},{stock:10000},{price:0},{price:NaN},{price:Infinity},{volume:0},{volume:1001}])assert.equal(m.updateVariant(a,p.id,v.id,patch),a);
 if(p.variants.length>1)assert.equal(m.updateVariant(a,p.id,v.id,{volume:p.variants[1].volume}),a);
 assert.equal(m.updateVariant(a,'missing',v.id,{stock:3}),a);
});
test('Demo order stages advance one step without skipping or changing other orders',()=>{
 const state=m.createAdminState(),order=state.orders[0];assert.equal(m.advanceOrder(state,order.id,m.orderSteps[2]),state);
 const next=m.advanceOrder(state,order.id,m.orderSteps[1]);assert.equal(next.orders[0].status,m.orderSteps[1]);assert.equal(next.orders[0].history.length,order.history.length+1);assert.equal(next.orders[1],state.orders[1]);assert.equal(state.orders[0].status,m.orderSteps[0]);assert.equal(m.advanceOrder(next,order.id,m.orderSteps[0]),next);
});
test('Admin form rules reject incomplete products and unsafe integer inputs',()=>{
 assert.equal(Object.keys(m.validateAdminProduct({name:' ',brand:'',family:'',notes:''})).length,4);
 assert.equal(Object.keys(m.validateAdminProduct({name:'عطر نمونه',brand:'برند',family:'گلی',notes:'یاس'})).length,0);
 assert.equal(m.validInteger('12',0,100),true);for(const v of ['-1','1.2','1e2','','9007199254740992'])assert.equal(m.validInteger(v,0,100),false);
});
