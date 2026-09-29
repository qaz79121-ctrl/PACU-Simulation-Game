
import test from 'node:test'; import assert from 'node:assert/strict'; import fs from 'node:fs';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../js/app.js',import.meta.url),'utf8');
test('main UI contains HUD scene hotspots and modal',()=>{
 for(const id of ['score','patients','step','timer','scene','hotspots','modal','iconbar']) assert.match(html,new RegExp(`id="${id}"`));
});
test('app is GitHub Pages static and module based',()=>assert.match(html,/type="module".*js\/app\.js/s));

test('does not render an extra nurse sprite',()=>{
  assert.doesNotMatch(html,/id="nurse"/);
});
test('medication cabinet is designed for 38 large cards',()=>{
 const app=fs.readFileSync(new URL('../js/app.js',import.meta.url),'utf8');
 const css=fs.readFileSync(new URL('../css/game.css',import.meta.url),'utf8');
 assert.match(app,/38 種藥物/);
 assert.match(css,/grid-template-columns:repeat\(4,1fr\)/);
 assert.match(css,/max-height:150px/);
});
test('scene has no visible IV-side or monitor-side hotspot labels',()=>{
 assert.doesNotMatch(html,/>[^<]*點滴架側[^<]*<\/button>/);
 assert.doesNotMatch(html,/>[^<]*監視器側[^<]*<\/button>/);
});

test('patient click targets replace small PACU bedside buttons',()=>{
  assert.match(html,/data-patient="0"/);
  assert.match(html,/data-patient="1"/);
  assert.match(html,/data-patient="2"/);
  assert.doesNotMatch(html,/class="hotspot bed/);
});
test('only one 12-step control row remains',()=>{
  assert.doesNotMatch(html,/id="taskbar"/);
  assert.match(html,/id="iconbar"/);
});

test('scene interaction hotspots have no visible text labels',()=>{
  assert.match(html,/class="hotspot sink"[^>]*aria-label="洗手台"[^>]*><\/button>/);
  assert.match(html,/class="hotspot cart"[^>]*aria-label="電腦藥物車"[^>]*><\/button>/);
  assert.match(html,/class="hotspot doctor"[^>]*aria-label="醫師 ISBAR"[^>]*><\/button>/);
});
test('main nurse is a real movable character',()=>{
  assert.match(html,/id="mainNurse"/);
  assert.match(app,/moveNurseTo/);
});
test('12 icon buttons are task hints only',()=>{
  assert.match(app,/showTaskHint/);
  assert.match(app,/querySelectorAll\('#iconbar button'\)/);
});
