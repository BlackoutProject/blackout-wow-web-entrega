import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {join} from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
async function load(file) {
 const source=await readFile(file,'utf8');
 const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
 const context={exports:{}};vm.runInNewContext(compiled,context);return context.exports;
}
function flatten(value,prefix='') {
 return Object.fromEntries(Object.entries(value).flatMap(([key,value])=>typeof value==='object'&&!Array.isArray(value)?Object.entries(flatten(value,prefix+key+'.')):[[prefix+key,value]]));
}
const {resources}=await load('src/i18n/resources.ts');
const {warcraftCopy}=await load('src/lib/warcraft-copy.ts');
const {homeOverviewCopy}=await load('src/lib/home-overview-copy.ts');
const {interfaceCopy}=await load('src/lib/interface-copy.ts');
const {rulesCopy}=await load('src/lib/rules-copy.ts');
const {connectionCopy}=await load('src/lib/connection-copy.ts');
const {storeShowcaseCopy}=await load('src/lib/store-showcase-copy.ts');
const {supportCopy}=await load('src/lib/support-copy.ts');
const {communityCopy}=await load('src/lib/community-copy.ts');
const {serverCopy}=await load('src/lib/server-copy.ts');
const {classSpellsCopy}=await load('src/lib/class-spells-copy.ts');
const {serverGuideCopy}=await load('src/lib/server-guide-copy.ts');
const {steelHomeCopy}=await load('src/lib/steel-home-copy.ts');
function leaves(value,prefix=''){
 return Object.fromEntries(Object.entries(value).flatMap(([key,item])=>item!==null&&typeof item==='object'?Object.entries(leaves(item,prefix+key+'.')):[[prefix+key,item]]));
}
for(const [name,copy] of Object.entries({warcraft:warcraftCopy,overview:homeOverviewCopy,steel:steelHomeCopy,rules:rulesCopy,connection:connectionCopy,store:storeShowcaseCopy,support:supportCopy,community:communityCopy,server:serverCopy,spells:classSpellsCopy,guide:serverGuideCopy})){
 const expected=Object.keys(leaves(copy.es)).sort();
 for(const lang of ['es','en','pt']){
  const entries=leaves(copy[lang]);
  assert.deepEqual(Object.keys(entries).sort(),expected,'Incomplete '+name+' content: '+lang);
  for(const [key,value] of Object.entries(entries))assert.ok(typeof value==='string'&&value.trim(),'Empty '+name+' translation: '+lang+'.'+key);
 }
}
console.log('PASS: all rules, connection-guide and store-showcase fields translated in ES/EN/PT');
const base=flatten(resources.es.translation);
for(const lang of ['es','en','pt']){
 const entries=flatten(resources[lang].translation);
 assert.deepEqual(Object.keys(entries).sort(),Object.keys(base).sort(),'Incomplete locale '+lang);
 for(const [key,value] of Object.entries(entries)){
  assert.ok(typeof value==='string'&&value.trim(),lang+'.'+key+' empty');
  assert.deepEqual([...value.matchAll(/\{\{(\w+)\}\}/g)].map(x=>x[1]).sort(),[...base[key].matchAll(/\{\{(\w+)\}\}/g)].map(x=>x[1]).sort(),'Broken variables: '+lang+'.'+key);
 }
 assert.deepEqual(Object.keys(warcraftCopy[lang]).sort(),Object.keys(warcraftCopy.es).sort(),'Incomplete homepage '+lang);
}
async function walk(dir){const files=[];for(const item of await readdir(dir,{withFileTypes:true})){const p=join(dir,item.name);if(item.isDirectory())files.push(...await walk(p));else if(/\.[jt]sx?$/.test(item.name))files.push(p);}return files;}
let calls=0;
for(const file of await walk('src')){
 const text=await readFile(file,'utf8');
 for(const match of text.matchAll(/\bui\((['"])(.*?)\1\)/g)){
  calls++;assert.ok(interfaceCopy[match[2]],'Missing EN/PT interface translation in '+file+': '+match[2]);
 }
 for(const match of text.matchAll(/\bt\((['"])([^'"]+)\1\s*[,)]/g))assert.ok(base[match[2]],'Missing translation key: '+match[2]);
}
console.log('PASS: '+Object.keys(base).length+' resource keys in ES/EN/PT, interpolation variables and '+calls+' interface labels');
console.log('PASS: all '+Object.keys(warcraftCopy.es).length+' homepage copy fields exist in each language');
