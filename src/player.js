// Copyright (c) 2026 Motion Atlas contributors — MIT License.
import { byId } from './catalog.js';
import { clamp } from './math.js';
import { createState, inputState } from './state.js';
import { render } from './renderer.js';
import {defaultParameters,normalizeParameters,parameterSpecs,parsePreset} from './parameters.js';

const livePlayers=new Set();
let animationId=0,previous=0;
function schedule(){if(!animationId&&[...livePlayers].some(p=>p.active()))animationId=requestAnimationFrame(frame);}
function frame(now){animationId=0;const dt=previous?clamp((now-previous)/1000,0,.07):0;previous=now;for(const p of livePlayers)if(p.active())p.tick(dt);if([...livePlayers].some(p=>p.active()))schedule();else previous=0;}

/** キャンバスへ描画する。利用後は destroy() でリソースを解放する。 */
export function createPlayer(canvas,id,options={}){
  const entry=typeof id==='string'?byId.get(id):id;
  if(!entry)throw new Error('デモが見つかりません: '+id);
  const context=canvas.getContext('2d',{alpha:false});
  if(!context)throw new Error('Canvas 2D が利用できません');
  let state=createState(entry),time=0,speed=1,strength=1,visible=!options.preview,dead=false;
  let parameters=normalizeParameters(entry,options.params),accent=null;
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  let playing=options.autoplay??!media.matches;
  const listeners=[];
  const on=(target,event,fn,opts)=>{target.addEventListener(event,fn,opts);listeners.push(()=>target.removeEventListener(event,fn,opts));};
  const draw=()=>{if(dead)return;render(context,entry,time,state,{preview:!!options.preview,strength:media.matches?Math.min(strength,.35):strength,params:parameters,accent});canvas.dataset.ready='true';options.onFrame?.({time,speed,strength,playing,state});};
  const eventTime=()=>time-(playing||options.clockRunning?.()?0:.6);
  const coordinates=ev=>{const r=canvas.getBoundingClientRect();return{x:clamp((ev.clientX-r.left)/r.width),y:clamp((ev.clientY-r.top)/r.height)};};
  const send=action=>{
    if(['up','activate'].includes(action.type)&&entry.interaction==='activate'&&
      !options.clockRunning&&(entry.added||entry.category!=='ui'||['spring','breathe','squash','anticipation','easing','overlap','masking','common','shot','beat','acrylic','dots'].includes(entry.kind)))time=0;
    inputState(state,entry,action,eventTime());draw();
  };
  if(!options.preview){
    canvas.tabIndex=0;canvas.setAttribute('role','img');canvas.setAttribute('aria-label',entry.label+'。Enterで操作、矢印で値や位置を変更');
    on(canvas,'pointerdown',ev=>{canvas.focus({preventScroll:true});canvas.setPointerCapture?.(ev.pointerId);send({type:'down',...coordinates(ev)});});
    on(canvas,'pointermove',ev=>send({type:'move',...coordinates(ev)}));
    on(canvas,'pointerup',ev=>{send({type:'up',...coordinates(ev)});if(canvas.hasPointerCapture?.(ev.pointerId))canvas.releasePointerCapture(ev.pointerId);});
    on(canvas,'pointercancel',()=>send({type:'leave'}));on(canvas,'pointerleave',()=>{if(!state.pressed)send({type:'leave'});});
    on(canvas,'keydown',ev=>{if([' ','Enter'].includes(ev.key)){ev.preventDefault();send({type:'activate'});}else if(ev.key.startsWith('Arrow')){ev.preventDefault();send({type:'key',dx:ev.key==='ArrowRight'?1:ev.key==='ArrowLeft'?-1:0,dy:ev.key==='ArrowDown'?1:ev.key==='ArrowUp'?-1:0});}else if(ev.key==='Home'){ev.preventDefault();api.reset();}});
    on(canvas,'wheel',ev=>{if(entry.kind!=='wheel')return;ev.preventDefault();send({type:'key',dy:ev.deltaY>0?1:-1});},{passive:false});
  }
  const resize=()=>{const r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,options.preview?1:2);if(r.width<1||r.height<1)return;canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);if(visible||!options.preview)draw();};
  const ro=new ResizeObserver(resize);ro.observe(canvas);
  const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){if(!canvas.dataset.ready)resize();schedule();}},{rootMargin:'120px'});io.observe(canvas);
  const unit={active:()=>!dead&&visible&&playing&&!document.hidden,tick:dt=>{time+=dt*speed;draw();}};livePlayers.add(unit);
  on(document,'visibilitychange',()=>{previous=0;if(!document.hidden)schedule();});
  on(media,'change',()=>{if(media.matches)playing=false;draw();schedule();});
  const api={
    entry,get time(){return time;},get playing(){return playing;},get state(){return state;},
    get parameters(){return{...parameters};},
    setParameter(key,value){if(!parameterSpecs(entry).some(p=>p.key===key))throw new Error('未知のパラメータ: '+key);parameters=normalizeParameters(entry,{...parameters,[key]:value});draw();},
    setAccent(value){if(value!==null&&!/^#[0-9a-f]{6}$/i.test(value))throw new Error('色は #rrggbb 形式で指定');accent=value;draw();},
    preset(){return{version:1,demo:entry.id,params:{...parameters},accent,time,speed,strength};},
    loadPreset(raw){const preset=parsePreset(raw,byId);if(preset.demo!==entry.id)throw new Error('別のデモの設定です');parameters=preset.params;accent=preset.accent;speed=preset.speed;strength=preset.strength;state=createState(entry);time=preset.time;draw();},
    resetParameters(){parameters=defaultParameters(entry);accent=null;draw();},
    play(){playing=true;schedule();draw();},pause(){playing=false;draw();},
    setSpeed(value){if(!Number.isFinite(value))throw new TypeError('速度は数値で指定');speed=clamp(value,.1,3);draw();},
    setStrength(value){if(!Number.isFinite(value))throw new TypeError('強度は数値で指定');strength=clamp(value,0,1.5);draw();},
    seek(value){if(!Number.isFinite(value))throw new TypeError('時刻は数値で指定');const next=Math.max(0,value),delta=next-time;state.at+=delta;for(const ev of [...state.events,...state.trail])ev.t+=delta;time=next;draw();},
    // 比較時計からの連続再生。入力イベントの発生時刻は動かさない。
    syncTime(value){if(!Number.isFinite(value))throw new TypeError('時刻は数値で指定');time=Math.max(0,value);draw();},
    activate(){send({type:'activate'});},setText(value){send({type:'text',text:value});},
    reset(){time=0;state=createState(entry);draw();},
    destroy(){if(dead)return;dead=true;playing=false;ro.disconnect();io.disconnect();listeners.forEach(off=>off());livePlayers.delete(unit);if(!livePlayers.size){cancelAnimationFrame(animationId);animationId=0;previous=0;}},
  };
  if(!options.preview)resize();schedule();return api;
}
