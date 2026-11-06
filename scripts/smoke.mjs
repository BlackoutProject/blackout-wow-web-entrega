import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const base = process.argv[2] || 'http://localhost:4177';
const routes=['/','/servidor','/como-conectarme','/login','/registro','/recuperar','/restablecer','/cuenta','/tienda','/tienda/puntos','/tienda/return','/dashboard/productos','/terminos-y-condiciones'];
const pages=new Map();
for(let start=0;start<routes.length;start+=4){
  const results=await Promise.allSettled(routes.slice(start,start+4).map(async path=>{
    const response=await fetch(base+path,{headers:{cookie:'lang=es'},signal:AbortSignal.timeout(60000)});
    assert.equal(response.status,200,path+' must render');
    const html=await response.text();pages.set(path,html);
    assert.ok(html.includes('BLACKOUT'),path+' missing application');
  }));
  for(const result of results)if(result.status==='rejected')throw result.reason;
}
console.log('PASS: 13 page routes render');
const internalLinks=new Set();
const externalLinks=new Set();
for(const [path,html] of pages)for(const match of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)){
  const url=new URL(match[1].replaceAll('&amp;','&'),base+path);
  if(url.origin===new URL(base).origin)internalLinks.add(url.pathname+url.search+url.hash);
  else if(url.protocol==='https:')externalLinks.add(url.href);
}
for(const link of internalLinks){
  const url=new URL(link,base);
  const path=url.pathname+url.search;
  if(!pages.has(path)){
    const response=await fetch(base+path,{signal:AbortSignal.timeout(30000)});
    assert.equal(response.status,200,'Broken internal link: '+link);
    pages.set(path,await response.text());
  }
  if(url.hash){
    const id=decodeURIComponent(url.hash.slice(1));
    assert.ok(pages.get(path).includes('id="'+id+'"'),'Missing anchor: '+link);
  }
}
console.log('PASS: '+internalLinks.size+' internal links and section anchors resolve');
console.log('External destinations: '+[...externalLinks].join(', '));
const home=pages.get('/');
const community = home.match(/<section\b[^>]*\bid="comunidad"[^>]*>[\s\S]*?<\/section>/)?.[0] ?? '';
assert.ok(community.includes('href="https://discord.gg/aH7cXcUUn4"'), 'Visitors must be able to join Discord directly');
assert.ok(community.includes('aria-controls="discord-channel-panel"') && community.includes('aria-expanded="false"'), 'Channel panel must be available on demand');
assert.doesNotMatch(community, /<iframe\b|<canvas\b|tides-original\.jpg/, 'Scrolling to Discord must not start the embed or a fullscreen animation');
assert.ok(home.includes('/login?next=%2Fcuenta%23donor'), 'Contributions must link to account login');
assert.ok(!/VIP Instance|VIP Mall|50 USD|200 USD/.test(home), 'Donor details must not appear on Home');
assert.ok(!pages.get('/cuenta').includes('id="donor"'), 'Signed-out account must not render Donor details');
console.log('PASS: official Discord widget and contribution login link; no Donor details in signed-out views');
for (const [path, html] of pages) {
  const header = html.match(/<header class="site-header">([\s\S]*?)<\/header>/)?.[1] || '';
  const footer = html.match(/<footer class="site-footer">([\s\S]*?)<\/footer>/)?.[1] || '';
  assert.ok(!/href="\/tienda(?:\/puntos)?"/.test(header + footer), 'Account-only navigation leaked into the global layout: ' + path);
}
for (const path of ['/tienda', '/tienda/puntos']) {
  assert.ok(/name="robots" content="[^"]*noindex/.test(pages.get(path)), 'Private shop must not be indexed: ' + path);
  assert.ok(!pages.get(path).includes('class="store-card'), 'Guest must not see the catalog');
}
const sitemap = await (await fetch(base + '/sitemap.xml')).text();
assert.ok(!sitemap.includes('/tienda'), 'Shop must not appear in the public sitemap');
assert.ok(home.match(/<header class="site-header">([\s\S]*?)<\/header>/)?.[1].includes('class="site-sound-toggle"'), 'Sound control must be visible in the header');
assert.ok(!home.match(/<footer class="site-footer">([\s\S]*?)<\/footer>/)?.[1].includes('class="site-sound-toggle"'), 'Sound control must not be duplicated in the footer');
console.log('PASS: account-only shop navigation, signed-out catalog guards, private search metadata and sound control');
// Headings may split their visible text across decorative spans.
const homeSummary = home.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
for(const fact of ['255','45 World Bosses','Evocador','Cazador de demonios','Monje','10 hechizos custom','Sistemas custom','Desata el caos.'])assert.ok(homeSummary.includes(fact),'Missing home summary fact: '+fact);
const pveFacts = home.match(/<dl class="[^"]*\bwc-path-facts\b[^"]*">([\s\S]*?)<\/dl>/)?.[1] || '';
assert.deepEqual([...pveFacts.matchAll(/<dt>([^<]+)(?:<small>[^<]+<\/small>)?<\/dt><dd>([^<]+)<\/dd>/g)].map(match=>[match[1],match[2]]), [['Raids en total','35'],['Raids custom','19'],['Mapas custom','30+']], 'Keep the total, custom raid subset and separate custom maps clear on Home');
assert.match(pveFacts, /Raids custom<small>De las 35 raids del servidor<\/small><\/dt><dd>19<\/dd>/, 'State explicitly that the 19 custom raids are included in the total of 35');
assert.ok(!/no pay to win|sin pay to win/i.test(home), 'Public claims must match confirmed mechanics');
assert.ok(!/\bVIP\b|\bDonor\b/.test(home.replace(/<script[\s\S]*?<\/script>/g,'')), 'Public homepage must only describe general server support');
assert.ok(!/players online|jugadores conectados|playersOnline/i.test(home),'Unexpected activity counter');
const server=pages.get('/servidor');
for(const fact of ['T1','T35','V1–V10','100.000','500','10 HECHIZOS CUSTOM POR CLASE','Pasivas Paragon','Battle Pass'])assert.ok(server.includes(fact),'Missing relocated server detail: '+fact);
const homeSections = [...home.matchAll(/<section\b[^>]*\bid="([^"]+)"/g)].map(match => match[1]);
assert.deepEqual(homeSections, ['trailer','reino','comunidad','tienda'], 'Homepage must present trailer, overview, community and support in order');
assert.ok(!home.includes('class="wc-class-list"') && server.includes('class="wc-class-list"'), 'Detailed class selector belongs on the server page');
assert.ok(home.includes('https://www.youtube.com/@Blackout-WoW-255'), 'Trailer must link to the real channel');
assert.ok(!/youtube(?:-nocookie)?\.com\/embed\//.test(home), 'Video must not load before the visitor chooses to play');
assert.ok(home.includes('href="#reino"'), 'Explore should lead to server highlights');
const trailerSection = home.match(/<section\b[^>]*\bid="trailer"[^>]*>[\s\S]*?<\/section>/)?.[0] ?? '';
assert.match(trailerSection, /class="wc-trailer-play"/, 'Visitors can start the trailer on Home');
assert.match(trailerSection, /href="https:\/\/www\.youtube\.com\/watch\?v=[A-Za-z0-9_-]{11}"/, 'The trailer also links directly to the video on YouTube');
for(const id of ['progresion','preguntas']) assert.ok(server.includes('id="'+id+'"'), 'Missing progression or new-player help');
assert.equal((server.match(/<details>/g)||[]).length,3,'Server must offer three focused new-player questions');
for(const fact of ['Paladín','Guerrero','Caballero de la Muerte','Mago','Pícaro','Sacerdote','Chamán','Druida','Cazador','Brujo','Cataclysm','MoP','WoD','Legion','BfA','Shadowlands','Dragonflight','The War Within'])assert.ok(server.includes(fact),'Missing spell detail: '+fact);
for(const fact of ['Elfo del Vacío','Mecagnomo','Dracthyr','Humano de Kul Tiras','Pandaren','Enano Hierro Negro','Draenei forjado por la Luz','Nocheterna','Vulpera','Trol Zandalari','Orco Mag’har','Tauren Monte Alto','razas de WotLK','16 apariencias raciales'])assert.ok(server.includes(fact),'Missing race/morph detail: '+fact);
assert.ok(!server.includes('16 razas jugables'),'Morphs must not be presented as playable races');
for(const id of ['pve','pvp','hechizos-custom','razas-y-morphs'])assert.ok(server.includes('id="'+id+'"'),'Broken section anchor '+id);
console.log('PASS: announced facts, 10 classes, expansion sources, section anchors, no online counter');
assert.ok(!home.includes('15+'), 'Outdated raid count');
const downloads=pages.get('/como-conectarme');
for(const id of ['1_3-KSxI1XKdsgpOJwkeKi6gboDQ1M1Mg','15eqo-VXNtD-8JelsrHfoPnogeNKddJKE','1-w4jnu1TxzwASASyO-qEkN_JURE8NPk-','1_lURvxnmrZYuwzT5L7uGLgRV4G0CzIjd'])assert.ok(downloads.includes(id),'Missing confirmed download: '+id);
assert.ok(downloads.includes('Instala los dos addons obligatorios'),'Required addons missing');
assert.ok(!downloads.includes('1YXqxzPbBd5TAyLZ1yu0c0o64X8UGOtxi'),'Obsolete patch link present');
console.log('PASS: both clients and both required addons linked; obsolete patch link removed');
const freshClientPath=downloads.match(/<article[^>]+id="instalacion-nuevo"[^>]*>([\s\S]*?)<\/article>/)?.[1];
const existingClientPath=downloads.match(/<article[^>]+id="instalacion-existente"[^>]*>([\s\S]*?)<\/article>/)?.[1];
assert.ok(freshClientPath && existingClientPath, 'Both guided installation choices must render');
for(const id of ['1_3-KSxI1XKdsgpOJwkeKi6gboDQ1M1Mg','15eqo-VXNtD-8JelsrHfoPnogeNKddJKE'])assert.ok(freshClientPath.includes(id) && !existingClientPath.includes(id), 'Client download must stay inside the new-client option: '+id);
for(const id of ['1-w4jnu1TxzwASASyO-qEkN_JURE8NPk-','1_lURvxnmrZYuwzT5L7uGLgRV4G0CzIjd','KshwXbJZ#4v_D_CDfwYPKqNu4KgWGRhK45HSp_9yhv8sjTgDe2F4'])assert.ok(existingClientPath.includes(id) && !freshClientPath.includes(id), 'Separate addon download must stay inside the existing-client option: '+id);
for (const path of [freshClientPath, existingClientPath]) {
  for (const url of [
    'https://mega.nz/file/Ds4T0KaR#tvx9ZKoLGR2ibW2YqNHM9rjxDxkw4tQtyulxLf5YpYY',
    'https://drive.google.com/file/d/18zFPYn4CBTduIFF0bO-Of_nSxX6P6nCL/view?usp=sharing'
  ]) assert.ok(path.includes('href="'+url+'"'), 'Missing patch download: '+url);
}
assert.ok(!downloads.includes('class="connect-downloads"'), 'Downloads must be attached to their installation option, not a separate list');
console.log('PASS: client and addon downloads appear only in the relevant installation choice; patches appear in both');
assert.ok(downloads.includes('Ambas opciones requieren los parches y WoW.exe'), 'Required installation components must remain explicit');
assert.doesNotMatch(downloads, /connection-download-pending|Enlace pendiente de publicación/);
assert.ok(downloads.includes('Ambos ya incluyen el realmlist de Blackout y los dos addons'), 'Both official clients include both addons and the realmlist');
assert.ok(home.includes('/warcraft/blackout-orc-poster.webp') && !home.includes('/warcraft/icecrown.mp4'), 'Blackout orc must replace the Lich King hero');
const policyChecks = {
 es:['Está prohibido compartir cuentas.', 'sin combatir, farmear, ayudar ni participar en PvP', 'Need', 'Greed', 'Tokens', 'Pérdida de recompensas, Honor o rating.'],
 en:['Account sharing is forbidden.', 'without fighting, farming, assisting or taking part in PvP', 'Need', 'Greed', 'Tokens', 'Loss of rewards, Honor or rating.'],
 pt:['É proibido compartilhar contas.', 'sem combater, farmar, ajudar ou participar de PvP', 'Need', 'Greed', 'Tokens', 'Perda de recompensas, Honra ou rating.']
};
for(const [lang,phrases] of Object.entries(policyChecks)){
 const response=await fetch(base+'/terminos-y-condiciones',{headers:{cookie:'lang='+lang}});
 const html=await response.text();
 for(const phrase of phrases)assert.ok(html.includes(phrase),'Missing rule in '+lang+': '+phrase);
 for(const id of ['respeto','publicidad','multiboxing','pvp-exploits','loot','cuentas-comercio','privacidad','sanciones'])assert.ok(html.includes('id="'+id+'"'),'Missing rule category '+id);
 assert.ok(!html.includes('@everyone'),'Discord announcement formatting must not leak into the rules');
}
console.log('PASS: seven rule categories and sanctions in ES/EN/PT; mandatory patches and both installation paths');

const languages={es:'Desata el',en:'Unleash',pt:'Liberte o'};
await Promise.all(Array.from({length:4},()=>Object.entries(languages)).flat().map(async([lang,label])=>{
  const response=await fetch(base+'/',{headers:{cookie:'lang='+lang},signal:AbortSignal.timeout(60000)});
  const html=await response.text();
  assert.ok(html.includes('<html lang="'+lang+'"'),'Wrong HTML language: '+lang);
  assert.ok(html.includes(label),'SSR language leaked across requests: '+lang);
}));
console.log('PASS: 12 concurrent requests keep ES/EN/PT content isolated');
const assets=new Set();
for(const html of pages.values())for(const match of html.matchAll(/(?:src|poster|href)="([^"]+)"/g)){
  const path=match[1];
  if(path.startsWith('/') && /\.(?:webp|png|jpe?g|mp4|mp3|css|js|woff2?|ttf)(?:\?|$)/.test(path) && !path.includes('&amp;'))assets.add(path);
}
for(const css of ['src/app/warcraft.css','src/app/portal.css','src/app/blackout.css','src/app/visual-refinements.css','src/app/cinematic-polish.css','src/app/blackout-steel.css','src/components/HomeWorld.module.css']){
  const text=await readFile(resolve(css),'utf8');
  for(const match of text.matchAll(/url\(['"]?(\/[^'")]+)['"]?\)/g))assets.add(match[1]);
}
for(const path of ['/warcraft/classes/evoker.png','/warcraft/classes/demon-hunter.png','/warcraft/classes/monk.png','/warcraft/blackout-orc.mp4','/warcraft/illidan.mp4','/cinematic/scene-03-shadow-kling.mp4'])assets.add(path);
for(const asset of JSON.parse(await readFile('design/high-resolution-art.json','utf8')).assets)assets.add('/'+asset.file.replaceAll('\\','/').replace(/^public\//,''));
const array=[...assets];
for(let start=0;start<array.length;start+=8){
 const results=await Promise.allSettled(array.slice(start,start+8).map(async path=>{
  const response=await fetch(base+path,{method:'HEAD',signal:AbortSignal.timeout(30000)});
  assert.equal(response.status,200,'Missing asset: '+path);
 }));
 for(const result of results)if(result.status==='rejected')throw result.reason;
}
console.log('PASS: '+assets.size+' referenced local assets respond, including all 3 videos');
const missing=await fetch(base+'/__blackout_missing_page__');
assert.equal(missing.status,404);
console.log('PASS: unknown routes return 404');
