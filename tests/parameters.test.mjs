import test from 'node:test';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {createCanvas} from '@napi-rs/canvas';
import {catalog,byId} from '../src/catalog.js';import {parameterSpecs,defaultParameters,normalizeParameters,parsePreset} from '../src/parameters.js';import {render} from '../src/renderer.js';import {createState} from '../src/state.js';
test('61件は一意な描画方式と2つ以上の専用調整項目を持つ',()=>{const added=catalog.filter(e=>e.added);assert.equal(added.length,61);assert.equal(new Set(added.map(e=>e.kind)).size,61);for(const e of added)assert.ok(e.parameters.length>=2,e.id);});
test('全パラメータは有限値のみを受理し、範囲を守る',()=>{for(const e of catalog)for(const spec of parameterSpecs(e)){assert.equal(normalizeParameters(e,{[spec.key]:spec.max+100})[spec.key],spec.max);assert.equal(normalizeParameters(e,{[spec.key]:spec.min-100})[spec.key],spec.min);assert.throws(()=>normalizeParameters(e,{[spec.key]:NaN}),TypeError);}});
test('プリセットは往復でき、不明ID・不正値・不正な色を拒否する',()=>{const entry=byId.get('pendulum'),preset={version:1,demo:entry.id,params:defaultParameters(entry),time:2.5,speed:.5,strength:1,accent:null};assert.deepEqual(parsePreset(JSON.stringify(preset),byId),preset);for(const bad of [{...preset,demo:'missing'},{...preset,accent:'red'},{...preset,time:-1},{...preset,speed:'1'},{...preset,params:[]}])assert.throws(()=>parsePreset(bad,byId));});
test('専用パラメータを動かすと内容領域の描画が変化する',()=>{
  const canvas=createCanvas(640,400),ctx=canvas.getContext('2d'),hash=()=>createHash('sha256').update(ctx.getImageData(55,60,530,275).data).digest('hex');
  for(const e of catalog)for(const spec of parameterSpecs(e).filter(p=>p.key!=='scale')){
    let changed=false;for(const time of [1.37,3.41]){render(ctx,e,time,createState(e),{preview:true,params:{[spec.key]:spec.min}});const first=hash();render(ctx,e,time,createState(e),{preview:true,params:{[spec.key]:spec.max}});if(hash()!==first){changed=true;break;}}
    assert.ok(changed,e.id+': '+spec.key);
  }
});
