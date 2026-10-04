import test from 'node:test';
import assert from 'node:assert/strict';
import {createComparisonClock} from '../src/compare-clock.js';

test('比較の単一時計は左右へ同じ時刻を送り、停止・シーク・非表示・再開・破棄を処理する',()=>{
  const frames=new Map();let id=0,visible=true;const sides=[[],[]];
  const clock=createComparisonClock(t=>sides.forEach(side=>side.push(t)),{request:fn=>{frames.set(++id,fn);return id;},cancel:n=>frames.delete(n),isVisible:()=>visible});
  const frame=t=>{const batch=[...frames.values()];frames.clear();batch.forEach(fn=>fn(t));};
  clock.play();frame(1000);frame(1050);assert.equal(clock.time,.05);assert.equal(frames.size,1);
  visible=false;clock.visibilityChanged();assert.equal(frames.size,0);frame(2000);assert.equal(clock.time,.05);
  visible=true;clock.visibilityChanged();frame(3000);assert.equal(clock.time,.05);frame(3050);assert.equal(clock.time,.1);
  clock.pause();assert.equal(frames.size,0);clock.seek(2.5);assert.equal(clock.time,2.5);assert.equal(clock.running,false);
  assert.throws(()=>clock.seek(NaN),TypeError);clock.play();frame(4000);frame(4100);assert.equal(clock.time,2.57);
  assert.deepEqual(sides[0],sides[1]);clock.destroy();assert.equal(frames.size,0);assert.equal(clock.running,false);
});
