import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {test} from 'node:test';
import ts from 'typescript';
let fetchResponse;
const root=path.resolve('src'),cache=new Map();
function load(relative){const filename=path.resolve(root,relative);assert.ok(filename.startsWith(root+path.sep));if(cache.has(filename))return cache.get(filename).exports;const module={exports:{}};cache.set(filename,module);const {outputText}=ts.transpileModule(fs.readFileSync(filename,'utf8').replaceAll('import.meta.env',JSON.stringify({BASE_URL:'/perfume-onlineshop/'})),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}});vm.runInNewContext(outputText,{module,exports:module.exports,URLSearchParams,fetch:(...args)=>fetchResponse(...args),require:s=>{assert.ok(s.startsWith('.'));return load(path.relative(root,path.resolve(path.dirname(filename),s+'.ts')));}},{filename});return module.exports;}
const m=load('admin/model.ts'),{parseRoute}=load('lib/routes.ts'),{products}=load('data/products.ts');
test('Seller variant codes encode volume and concentration and resolve prefix collisions',()=>{
 const variant=(volume,concentration)=>({volume,concentration,price:100,stock:1});
 const codes=m.codedVariants([
  {name:'Aventus',variants:[variant(50,'EDP'),variant(150,'EDT'),variant(55,'EDP'),variant(5,'EDP')]},
  {name:'Avenue',variants:[variant(50,'EDP')]},
  {name:'آونتوس',variants:[variant(50,'EDP')]},
  {name:'Bleu de Chanel',variants:[variant(100,'EDT'),variant(100,'EDP')]},
  {name:'Miss Dior',variants:[variant(200,'EDP')]},
 ]).map(row=>row.code);
 assert.equal(JSON.stringify(codes),JSON.stringify(['ave05P','ave15T','ave05P-2','ave00P','ave05P-3','آون05P','bdc10T','bdc10P','mid20P']));
});
test('Manual codes are validated, preserved as entered, and released when cleared',()=>{
 const state=m.createAdminState(),[product,other]=state.products,[variant]=product.variants,[second]=other.variants;
 for(const manualCode of ['ABCDEF','123456','AB123'])assert.equal(m.updateVariant(state,product.id,variant.id,{manualCode}),state);
 const next=m.updateVariant(state,product.id,variant.id,{manualCode:'  Aroma19T  '});
 assert.equal(m.codedVariants(next.products).find(row=>row.variant.id===variant.id).code,'Aroma19T');
 assert.equal(m.updateVariant(next,other.id,second.id,{manualCode:'aroma19t'}),next);
 const reset=m.updateVariant(next,product.id,variant.id,{manualCode:''});
 assert.equal(m.codedVariants(reset.products).find(row=>row.variant.id===variant.id).code,m.codedVariants(state.products).find(row=>row.variant.id===variant.id).code);
});
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
test('Only the inventory shortcut accepts the low-stock filter',()=>{
 assert.equal(parseRoute('#/seller/inventory?stock=low').admin.stockFilter,'low');
 assert.equal(parseRoute('#/seller/inventory').admin.stockFilter,undefined);
 assert.equal(parseRoute('#/seller/inventory?stock=invalid').admin.stockFilter,undefined);
 assert.equal(parseRoute('#/seller/variants?stock=low').admin.stockFilter,undefined);
});
test('Admin inventory changes never mutate storefront fixtures or other session snapshots',()=>{
 const original=JSON.stringify(products),a=m.createAdminState(),b=m.createAdminState(),p=a.products[0],v=p.variants[0];
 const changed=m.updateVariant(a,p.id,v.id,{stock:0,price:123456,volume:17});assert.equal(changed.products[0].variants[0].stock,0);assert.equal(changed.products[0].variants[0].price,123456);
 assert.equal(JSON.stringify(products),original);assert.equal(JSON.stringify(a),JSON.stringify(b));
 for(const patch of [{stock:-1},{stock:1.2},{stock:10000},{price:0},{price:NaN},{price:Infinity},{volume:0},{volume:1001}])assert.equal(m.updateVariant(a,p.id,v.id,patch),a);
 const otherConcentration=v.concentration==='EDT'?'EDP':'EDT';
 assert.equal(m.updateVariant(a,p.id,v.id,{concentration:otherConcentration}),a);
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

test('Draft usage uses independent stable codes and surfaces server validation', async () => {
 const {usageFields,usageCodes,usageLabel}=load('admin/usageOptions.ts');
 const {sellerDraftApi}=load('admin/sellerDraftApi.ts');
 const labels=['بهار، زمستان','محیط کار','صبح، عصر'];
 const usage=Object.fromEntries(usageFields.map(({key},i)=>[key,usageCodes(key,labels[i])]));
 const expected={seasons:['spring','winter'],occasions:['work'],dayTimes:['morning','evening']};
 fetchResponse=async(url,init)=>{
  assert.equal(init.method,'PATCH');
  const body=JSON.parse(init.body);
  for(const key of Object.keys(expected))assert.deepEqual(body[key],expected[key]);
  return {ok:true,status:200,json:async()=>body};
 };
 const saved=await sellerDraftApi.save('Usage','csrf','draft-7',undefined,undefined,undefined,usage);
 for(const [i,{key}] of usageFields.entries())assert.equal(saved[key].map(code=>usageLabel(key,code)).join('، '),labels[i]);
 fetchResponse=async()=>({ok:false,status:400,json:async()=>({dayTimes:['Invalid choice']})});
 await assert.rejects(sellerDraftApi.save('Usage','csrf','draft-7',undefined,undefined,undefined,usage),/زمان استفاده/);
 fetchResponse=async()=>({ok:false,status:503});
 await assert.rejects(sellerDraftApi.get('draft-7'),/دریافت پیش‌نویس ناموفق بود/);
});
