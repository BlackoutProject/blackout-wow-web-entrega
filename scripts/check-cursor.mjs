import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const source = await readFile('src/components/BlackoutCursor.tsx', 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
const events = new Map();
const root = { dataset: {}, removeAttribute: () => { delete root.dataset.blackoutCursor; }, addEventListener: (name, fn) => events.set(name, fn), removeEventListener: name => events.delete(name) };
const cursor = { dataset: {}, style: {} };
let cleanup;
class Element {
  constructor(kind) { this.kind = kind; }
  closest(selector) {
    if (selector.startsWith('input')) return this.kind === 'input' ? this : null;
    if (selector.startsWith('.site-shell')) return this.kind === 'art' ? this : null;
    return this.kind === 'button' || this.kind === 'art' ? this : null;
  }
}
let target = new Element('button');
const fine = { matches: true, addEventListener() {}, removeEventListener() {} };
const contrast = { ...fine, matches: false };
const context = {
  exports: {}, Element,
  document: { documentElement: root, elementFromPoint: () => target, hidden: false, addEventListener: (name, fn) => events.set(name, fn), removeEventListener: name => events.delete(name) },
  window: { addEventListener: (name, fn) => events.set(name, fn), removeEventListener: name => events.delete(name) },
  matchMedia: query => query.includes('forced-colors') ? contrast : fine,
  require: name => name === 'react' ? { useRef: () => ({ current: cursor }), useEffect: effect => { cleanup = effect(); } } : require(name),
};
vm.runInNewContext(compiled, context);
context.exports.BlackoutCursor();
const pointer = (type, extra = {}) => events.get(type)({ pointerType: 'mouse', clientX: 150, clientY: 100, target, ...extra });
pointer('pointermove');
assert.equal(root.dataset.blackoutCursor, 'painted');
assert.equal(cursor.dataset.visible, 'true');
assert.equal(cursor.style.transform, 'translate3d(145px,96px,0)');
for (let i = 0; i < 30; i++) {
  pointer('pointerdown');
  assert.equal(root.dataset.blackoutCursor, 'painted', 'Press must never restore the native white cursor');
  assert.equal(cursor.dataset.visible, 'true');
  target = new Element('button'); // replacement content after a tab or route changes
  pointer('pointerover');
  assert.equal(root.dataset.blackoutCursor, 'painted');
  pointer('pointerup');
  assert.equal(cursor.dataset.pressed, 'false');
  assert.equal(root.dataset.blackoutCursor, 'painted');
}
target = new Element('input'); pointer('pointerover');
assert.equal(cursor.dataset.visible, 'false', 'Editable fields retain their native caret');
assert.equal(root.dataset.blackoutCursor, undefined);
target = new Element('button'); pointer('pointerover');
assert.equal(root.dataset.blackoutCursor, 'painted');
let prevented = false;
events.get('dragstart')({ target: new Element('art'), preventDefault: () => { prevented = true; } });
assert.ok(prevented, 'Artwork must not start a native ghost drag');
pointer('pointerleave', { relatedTarget: null });
assert.equal(cursor.dataset.visible, 'false');
assert.equal(root.dataset.blackoutCursor, undefined);
pointer('pointermove', { pointerType: 'touch' });
assert.equal(cursor.dataset.visible, 'false', 'No painted cursor on touch');
contrast.matches = true; pointer('pointermove');
assert.equal(root.dataset.blackoutCursor, undefined, 'Forced colors keep OS cursor');
cleanup();
assert.equal(events.size, 0);
console.log('PASS: 30 press/release/replacement cycles; native caret, drag prevention, window leave, touch, forced colors and cleanup.');
