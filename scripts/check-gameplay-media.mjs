import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const source = await readFile('src/lib/gameplay-media.ts', 'utf8');
const context = { exports: {} };
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
const { gameplayMedia, gameplayMediaCopy, mediaForTopic } = context.exports;
const topics = ['collection','evoker','demon-hunter','monk','aio','paragon','battle-pass','transmog','druid','mall','convenience'];
const ids = new Set();
for (const item of gameplayMedia) {
  assert.ok(item.id && !ids.has(item.id), 'Duplicate or missing media ID'); ids.add(item.id);
  assert.ok(topics.includes(item.topic), 'Unknown media topic: ' + item.topic);
  assert.ok(['image','video'].includes(item.kind), 'Invalid media type');
  assert.ok(item.width > 0 && item.height > 0, 'Missing media dimensions');
  for (const lang of ['es','en','pt']) assert.ok(item.caption[lang]?.trim(), 'Missing caption: ' + item.id + '/' + lang);
  for (const asset of [item.src, item.poster]) {
    assert.match(asset, /^\/blackout-media\/[a-zA-Z0-9/_-]+\.(?:webp|png|jpe?g|mp4)$/);
    await access(path.join('public', asset.slice(1)));
  }
  assert.match(item.poster, /\.(?:webp|png|jpe?g)$/);
  assert.match(item.src, item.kind === 'video' ? /\.mp4$/ : /\.(?:webp|png|jpe?g)$/);
}
for (const lang of ['es','en','pt']) {
  assert.deepEqual(Object.keys(gameplayMediaCopy[lang]).sort(), Object.keys(gameplayMediaCopy.es).sort());
  assert.ok(Object.values(gameplayMediaCopy[lang]).every(value => value.trim()));
}
for (const topic of topics) assert.ok(mediaForTopic(topic).every(item => item.topic === topic));
console.log(`PASS: ${gameplayMedia.length} verified media entries; local assets, captions and topics valid; empty topics stay unpublished.`);

// Render isolated fixtures without exposing sample artwork in the public site.
const require = createRequire(import.meta.url);
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const gallerySource = ts.transpileModule(await readFile('src/components/GameplayGallery.tsx','utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
let fixtures = [], currentLanguage = 'es';
const mocks = {
  'next/image': { default: ({src,alt,width,height}) => React.createElement('img',{src,alt,width,height}) },
  'react-i18next': { useTranslation: () => ({i18n:{language:currentLanguage}}) },
  '@/i18n/settings': { resolveAppLanguage: value => value },
  '@/lib/gameplay-media': { gameplayMediaCopy, mediaForTopic: topic => fixtures.filter(item => item.topic === topic) },
  '@/lib/use-dialog-focus': { useDialogFocus: () => {} },
  './GameplayGallery.module.css': { default: {} },
};
const galleryContext = {exports:{}, require: name => name in mocks ? mocks[name] : require(name)};
vm.runInNewContext(gallerySource,galleryContext);
const {GameplayGallery} = galleryContext.exports;
assert.equal(renderToStaticMarkup(React.createElement(GameplayGallery,{topic:'collection',featured:true})), '');
fixtures = [
  {id:'test-image',topic:'collection',kind:'image',src:'/blackout-media/test-image.webp',poster:'/blackout-media/test-thumb.webp',width:1600,height:900,caption:{es:'Captura de prueba',en:'Test screenshot',pt:'Captura de teste'}},
  {id:'test-video',topic:'monk',kind:'video',src:'/blackout-media/test-video.mp4',poster:'/blackout-media/test-video.webp',width:1600,height:900,caption:{es:'Vídeo de prueba',en:'Test video',pt:'Vídeo de teste'}},
];
for (const language of ['es','en','pt']) {
  currentLanguage = language;
  for (const fixture of fixtures) {
    const html = renderToStaticMarkup(React.createElement(GameplayGallery,{topic:fixture.topic}));
    assert.ok(html.includes(fixture.caption[language]));
    assert.ok(html.includes(fixture.poster));
    assert.equal((html.match(/<button/g)??[]).length,1);
    assert.ok(!html.includes('<video') && !html.includes('.mp4') && !html.includes('role="dialog"'), 'Footage must not load before user interaction');
  }
  assert.equal(renderToStaticMarkup(React.createElement(GameplayGallery,{topic:'paragon'})), '');
}
console.log('PASS: empty topics render nothing; image/video cards are localized and clips load only after opening.');
