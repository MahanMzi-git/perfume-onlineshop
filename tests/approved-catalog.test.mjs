import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { test } from 'node:test';
import ts from 'typescript';

function catalogContext(search) {
  const root=path.resolve('src'), cache=new Map();
  const load=relative=>{
    const filename=path.resolve(root,relative);
    assert.ok(filename.startsWith(root+path.sep));
    if(cache.has(filename)) return cache.get(filename).exports;
    const module={exports:{}};cache.set(filename,module);
    const {outputText}=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}});
    vm.runInNewContext(outputText,{module,exports:module.exports,URLSearchParams,
      ...(search===undefined ? {} : {window:{location:{search}}}),
      require:specifier=>{assert.ok(specifier.startsWith('.'));return load(path.relative(root,path.resolve(path.dirname(filename),specifier+'.ts')));},
    },{filename});
    return module.exports;
  };
  return load;
}

test('Approved photo catalog is identical for default browser, old preview links and server rendering',()=>{
  const identities=search=>Array.from(catalogContext(search)('data/products.ts').products,p=>p.id+':'+p.name);
  const defaults=identities('');
  assert.equal(defaults.length,9);
  assert.deepEqual(defaults,identities(undefined));
  assert.deepEqual(defaults,identities('?cardPreview=immersive'));
  assert.ok(defaults.some(p=>p.endsWith(':Bleu de Chanel')));
  const legacy=identities('?cardPreview=legacy');assert.equal(legacy.length,8);assert.ok(legacy.includes('p1:Rose Voile'));
});

test('Approved catalog has local photos, valid brands and notes, and consistent independent demo variants',()=>{
  const load=catalogContext(''),{products}=load('data/products.ts'),{brands}=load('data/brands.ts'),{scentNotes}=load('data/scentNotes.ts');
  const variantIds=new Set();
  for(const p of products) {
    assert.ok(brands.some(b=>b.id===p.brandId));
    assert.ok(p.scentNoteIds.length>=2&&p.scentNoteIds.length<=4);
    assert.ok(p.scentNoteIds.every(id=>scentNotes.some(n=>n.id===id)));
    assert.ok(fs.existsSync(path.join('public',p.image)));
    assert.equal(p.gallery[0].src,p.image);
    assert.equal(p.availability,'demo');assert.ok(p.reviews.length >= 2);assert.ok(p.reviews.every(review => Number.isInteger(review.score) && review.score >= 1 && review.score <= 5 && review.id.includes('-sample-')));
    assert.equal(p.variants[0].price,p.price);
    for(const v of p.variants) {assert.ok(!variantIds.has(v.id));variantIds.add(v.id);assert.equal(v.concentration,p.concentration);}
  }
});

test('Approved real names, brands and compound selected notes share the actual filter data',()=>{
  const load=catalogContext(''),{products}=load('data/products.ts'),{filterProducts}=load('lib/filter.ts');
  const names=filters=>Array.from(filterProducts(products,{query:'',...filters}),p=>p.name);
  assert.deepEqual(names({query:'aventus'}),['Aventus']);
  assert.deepEqual(names({query:'chanel'}),['Coco Mademoiselle','Bleu de Chanel']);
  assert.deepEqual(names({noteIds:['n-jasmine','n-rose']}),['Coco Mademoiselle']);
  assert.deepEqual(names({noteIds:['n-apricot']}),['Jasmin des Anges']);
});

test('Iran location snapshot covers every province with unique valid city choices',()=>{
  const {iranProvinces}=catalogContext('')('data/iranLocations.ts');
  assert.equal(iranProvinces.length,31);
  assert.equal(new Set(iranProvinces.map(p=>p.id)).size,31);
  assert.ok(iranProvinces.every(p=>p.cities.length>0&&new Set(p.cities).size===p.cities.length));
  assert.equal(iranProvinces.reduce((sum,p)=>sum+p.cities.length,0),1478);
  for(const [province,city] of [['تهران','تهران'],['البرز','کرج'],['فارس','شیراز'],['خراسان رضوی','مشهد']]) assert.ok(iranProvinces.find(p=>p.name===province)?.cities.includes(city));
});
