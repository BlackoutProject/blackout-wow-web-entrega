import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
const base = process.argv[2] || 'http://127.0.0.1:4177';
const context = { exports: {} };
vm.runInNewContext(ts.transpileModule(await readFile('src/lib/metadata-copy.ts','utf8'), { compilerOptions: {module: ts.ModuleKind.CommonJS} }).outputText, context);
const copy = context.exports.metadataTranslations;
const pages = new Map();
const languages = ['es','en','pt'];
const labels = {es:['Crear cuenta','Entrar','Cambiar idioma'],en:['Create account','Log in','Change language'],pt:['Criar conta','Entrar','Alterar idioma']};
const customClasses = {es:['Evocador','Cazador de demonios','Monje'],en:['Evoker','Demon Hunter','Monk'],pt:['Conjurante','Caçador de Demônios','Monge']};
const wotlkClasses = {es:['Paladín','Guerrero','Caballero de la Muerte','Mago','Pícaro','Sacerdote','Chamán','Druida','Cazador','Brujo'],en:['Paladin','Warrior','Death Knight','Mage','Rogue','Priest','Shaman','Druid','Hunter','Warlock'],pt:['Paladino','Guerreiro','Cavaleiro da Morte','Mago','Ladino','Sacerdote','Xamã','Druida','Caçador','Bruxo']};
const escapeHtml = value => value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll("'",'&#x27;').replaceAll('<','&lt;').replaceAll('>','&gt;');
for (const lang of languages) {
  const paths = Object.keys(copy);
  for (let i=0; i<paths.length; i+=4) {
    const results = await Promise.allSettled(paths.slice(i,i+4).map(async path => {
      const response = await fetch(base+path,{headers:{cookie:'lang='+lang},signal:AbortSignal.timeout(60000)});
      assert.equal(response.status,200,lang+' '+path);
      const html=await response.text(); pages.set(lang+path,html);
      if(path==='/' || path==='/servidor') {
        for(const name of customClasses[lang]) assert.ok(html.includes(name),'Missing localized class '+name+' in '+lang+path);
      }
      if(path==='/servidor') {
        const overview=html.split('class="lore-stats">')[1]?.split('<nav')[0] || '';
        assert.deepEqual([...overview.matchAll(/<strong>([^<]+)<\/strong>/g)].map(match=>match[1]),['255','35','19','30+'],'Keep total raids, custom raids and maps distinct: '+lang);
        assert.ok(!/lore-watermark|lore-customization-number|0[1-4] ·/.test(html),'Decorative section numbering: '+lang);
        for(const name of wotlkClasses[lang]) assert.ok(html.includes(name),'Missing class '+name+' in '+lang);
        for(const name of {es:['Mecagnomo','Nocheterna','Tauren Monte Alto'],en:['Mechagnome','Nightborne','Highmountain Tauren'],pt:['Gnomecânico','Filhos da Noite','Tauren Altamontês']}[lang]) assert.ok(html.includes(name),'Untranslated morph '+name);
        for(const phrase of {es:['más opciones de apariencia','objetos de morph','jugar con ella','10 hechizos custom procedentes de expansiones posteriores'],en:['more appearance options','morph items','play with it','10 custom spells from later expansions'],pt:['mais opções de aparência','itens de morph','jogar com ela','10 feitiços custom de expansões posteriores']}[lang]) assert.ok(html.toLocaleLowerCase().includes(phrase.toLocaleLowerCase()),'Race/spell clarification missing: '+lang+' '+phrase);
        assert.ok(!/Hechizos de WotLK|WotLK spells|Feitiços de WotLK/i.test(html),'Custom spell origin must not be mislabeled: '+lang);
        assert.ok(html.includes({es:'10 HECHIZOS CUSTOM POR CLASE',en:'10 CUSTOM SPELLS PER CLASS',pt:'10 FEITIÇOS CUSTOM POR CLASSE'}[lang]),'Custom spell count: '+lang);
      }
      if(path==='/registro') {
        assert.ok(new RegExp('<h[12][^>]*>'+labels[lang][0]+'</h[12]>').test(html), 'Registration heading language: '+lang);
        assert.ok(html.includes({es:'Verificación de seguridad',en:'Security verification',pt:'Verificação de segurança'}[lang]), 'Registration verification label: '+lang);
        assert.match(html, /<button[^>]*type="submit"[^>]*disabled/, 'Registration must wait for verification');
      }
      assert.ok(html.includes('<html lang="'+lang+'"'), 'Incorrect language: '+lang+path);
      assert.ok(/<title>[^<]+<\/title>/.test(html), 'Missing title: '+lang+path);
      if(lang!=='es') {
        assert.ok(html.includes(escapeHtml(copy[path][lang].title)), 'Untranslated title: '+lang+path);
        assert.ok(html.includes('name="description" content="'+escapeHtml(copy[path][lang].description)+'"'), 'Untranslated description: '+lang+path);
      }
      const header=html.match(/<header class="site-header">([\s\S]*?)<\/header>/)?.[1];
      assert.ok(header,'Header missing: '+lang+path);
      assert.ok(header.includes('CUSTOM · 255 · 3.3.5a'),'Client version missing');
      const controls=header.slice(header.indexOf('site-header-actions'));
      const register=controls.indexOf(labels[lang][0]);
      const login=controls.indexOf(labels[lang][1]);
      const language=controls.indexOf(labels[lang][2]);
      assert.ok(register>=0 && login>register && language>login,'Header action order: '+lang+path);
      assert.ok(!/\b(?:nav|auth|footer)\.[a-zA-Z]+\b/.test(html.replace(/<script[\s\S]*?<\/script>/g,'')),'Unresolved translation key: '+lang+path);
    }));
    for (const result of results) if(result.status==='rejected') throw result.reason;
  }
}
let anchors=0;
const seen=new Set();
for(const [key,html] of pages) {
  const lang=key.slice(0,2),path=key.slice(2);
  for(const match of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
    const url=new URL(match[1].replaceAll('&amp;','&'),base+path);
    if(url.origin!==new URL(base).origin) continue;
    assert.ok(url.pathname!=='/' || url.hash || match[1]!=='#','Empty destination: '+key);
    const identity=lang+url.pathname+url.search+url.hash;
    if(seen.has(identity))continue;seen.add(identity);
    let destination=pages.get(lang+url.pathname);
    if(!destination){
      const response=await fetch(url,{headers:{cookie:'lang='+lang},signal:AbortSignal.timeout(30000)});
      assert.equal(response.status,200,'Broken navigation: '+identity);
      destination=await response.text();
    }
    if(url.hash){anchors++;assert.ok(destination.includes('id="'+decodeURIComponent(url.hash.slice(1))+'"'),'Broken anchor: '+identity);}
  }
}
console.log('PASS: '+pages.size+' localized route responses; titles, descriptions, version, register/login/language order.');
console.log('PASS: '+seen.size+' internal destinations across ES/EN/PT, including '+anchors+' section anchors.');
