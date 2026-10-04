import test from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas} from '@napi-rs/canvas';
import {catalog} from '../src/catalog.js';
import {createPlayer} from '../src/player.js';

// Canvasは実描画、イベントと可視性は制御可能なブラウザ境界で検証する。
class TrackedTarget extends EventTarget {
  listeners=new Map();
  addEventListener(name,fn,options){super.addEventListener(name,fn,options);if(!this.listeners.has(name))this.listeners.set(name,new Set());this.listeners.get(name).add(fn);}
  removeEventListener(name,fn,options){super.removeEventListener(name,fn,options);this.listeners.get(name)?.delete(fn);}
  get count(){return [...this.listeners.values()].reduce((n,s)=>n+s.size,0);}
}
class Canvas extends TrackedTarget {
  data=createCanvas(640,400);dataset={};attrs={};
  set width(v){this.data.width=v;}set height(v){this.data.height=v;}
  getContext(){return this.data.getContext('2d');}
  getBoundingClientRect(){return{left:0,top:0,width:320,height:200};}
  setAttribute(k,v){this.attrs[k]=v;}focus(){}
}
const doc=new TrackedTarget(),media=new TrackedTarget(),rafs=new Map(),observers=new Set();let nextRaf=0;
doc.hidden=false;media.matches=false;
Object.assign(globalThis,{document:doc,matchMedia:()=>media,devicePixelRatio:2,
  requestAnimationFrame:fn=>{rafs.set(++nextRaf,fn);return nextRaf;},cancelAnimationFrame:id=>rafs.delete(id),
  ResizeObserver:class {observe(){}disconnect(){}},
  IntersectionObserver:class {constructor(fn){this.fn=fn;observers.add(this);}observe(){}disconnect(){observers.delete(this);}}
});
function frame(time){const queue=[...rafs.values()];rafs.clear();queue.forEach(fn=>fn(time));}
test('全200プレイヤーが実描画し、破棄後にイベント・監視・フレームを残さない',()=>{
  for(const e of catalog){const c=new Canvas(),p=createPlayer(c,e,{autoplay:false});assert.equal(c.dataset.ready,'true',e.id);p.activate();p.seek(2.5);p.reset();p.destroy();p.destroy();assert.equal(c.count,0,e.id);}
  assert.equal(doc.count,0);assert.equal(media.count,0);assert.equal(observers.size,0);assert.equal(rafs.size,0);
});
test('停止・速度・非表示・可視性が共有描画ループに反映される',()=>{
  const p=createPlayer(new Canvas(),'spring');frame(1000);frame(1050);assert.ok(p.time>.049);p.pause();const t=p.time;frame(1100);assert.equal(p.time,t);p.setSpeed(2);p.play();frame(2000);frame(2050);assert.ok(Math.abs(p.time-t-.1)<1e-10);doc.hidden=true;frame(2100);assert.equal(rafs.size,0);doc.hidden=false;doc.dispatchEvent(new Event('visibilitychange'));assert.equal(rafs.size,1);[...observers][0].fn([{isIntersecting:false}]);frame(2200);assert.equal(rafs.size,0);p.destroy();
});
test('reduced-motionは初期再生と設定変更時の再生を止め、明示的な再生は許す',()=>{
  media.matches=true;const p=createPlayer(new Canvas(),'spring');assert.equal(p.playing,false);p.play();assert.equal(p.playing,true);media.dispatchEvent(new Event('change'));assert.equal(p.playing,false);assert.throws(()=>p.setSpeed(NaN),TypeError);assert.throws(()=>p.seek(Infinity),TypeError);p.destroy();media.matches=false;
});
test('シークは入力からの経過時間を保ち、周期演出の操作は先頭へ戻す',()=>{
  const p=createPlayer(new Canvas(),catalog.find(e=>e.kind==='ripple'),{autoplay:false});p.seek(3);p.activate();const age=p.time-p.state.events[0].t;p.seek(1);assert.ok(Math.abs(p.time-p.state.events[0].t-age)<1e-10);p.destroy();const q=createPlayer(new Canvas(),'curl-noise',{autoplay:false});q.seek(5);q.activate();assert.equal(q.time,0);q.destroy();
});
test('プレイヤーの設定をJSON経由で復元し、独立した比較側へ反映できる',()=>{
  const left=createPlayer(new Canvas(),'spring',{autoplay:false}),right=createPlayer(new Canvas(),'spring',{autoplay:false});left.setParameter('damping',.3);left.setAccent('#e35577');left.setSpeed(.5);left.seek(2.2);const saved=JSON.stringify(left.preset());right.loadPreset(saved);assert.deepEqual(right.preset(),left.preset());right.setParameter('damping',1.4);assert.equal(left.parameters.damping,.3);assert.equal(right.parameters.damping,1.4);assert.throws(()=>right.setParameter('missing',3));left.destroy();right.destroy();
});
test('比較時計による再生は入力の経過時間を進め、操作で共通時刻をリセットしない',()=>{
  const p=createPlayer(new Canvas(),catalog.find(e=>e.kind==='ripple'),{autoplay:false,clockRunning:()=>true});
  p.syncTime(3);p.activate();assert.equal(p.time,3);assert.equal(p.state.events[0].t,3);
  p.syncTime(3.5);assert.equal(p.time-p.state.events[0].t,.5);p.destroy();
  const q=createPlayer(new Canvas(),'pendulum',{autoplay:false,clockRunning:()=>true});q.syncTime(5);q.activate();assert.equal(q.time,5);q.destroy();
});
