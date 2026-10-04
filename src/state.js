// Copyright (c) 2026 Motion Atlas contributors — MIT License.
import { clamp, mix, phase, spring, smooth } from './math.js';
export function createState(entry) {
  const value = entry?.interaction === 'drag' ? .5 : 0;
  const bits = entry?.kind === 'switch' ? 2 : 1;
  return { manual: false, value, from: value, at: -10, selected: 0, fromIndex: 0, count: 0, bits, fromBits: bits, text: '', pointer: [.5, .5], hover: false, pressed: false, events: [], trail: [], outcome: '' };
}
export function sampleState(s, t, strength = 1, preview = false) {
  const elapsed = Math.max(0, t - s.at);
  const a = clamp(elapsed * 3), progress = mix(smooth(a), spring(elapsed, .7, 13), strength);
  const cycle = phase(t, 4), target = cycle < .5 ? 1 : 0;
  const blend = spring(phase(t, 2) * 2, .7, 10);
  const v = !s.manual && preview ? mix(1 - target, target, blend) : mix(s.from, s.value, progress);
  const index = !s.manual && preview ? Math.floor(t / 2) % 3 : s.selected;
  const position = !s.manual && preview ? mix((index+2)%3,index,clamp(blend)) : mix(s.fromIndex,s.selected,clamp(progress));
  return { v, elapsed, index, position,
    px: !s.manual && preview ? .5 + .3 * Math.sin(t) : s.pointer[0],
    py: !s.manual && preview ? .5 + .22 * Math.cos(t * .8) : s.pointer[1] };
}
export function inputState(s, entry, action, t) {
  const x = clamp(action.x ?? s.pointer[0]), y = clamp(action.y ?? s.pointer[1]);
  const remember = (px,py) => {
    const dx=px-s.pointer[0],dy=py-s.pointer[1];
    if((dx||dy)&&['secondorder','follow'].includes(entry.kind))s.trail.push({dx,dy,t});
    if(s.trail.length>512){const a=s.trail.shift();s.trail[0].dx+=a.dx;s.trail[0].dy+=a.dy;}
  };
  if (['move','down','up'].includes(action.type)) remember(x,y);
  s.pointer = [x, y];
  if (action.type === 'leave') { s.hover = false; s.pressed = false; return; }
  if (action.type === 'move') { s.hover = true; if (entry.interaction === 'pointer') s.manual = true; if (!s.pressed || entry.interaction !== 'drag') return; }
  if (action.type === 'down') { s.pressed = true; s.hover = true; if (entry.interaction !== 'drag') return; }
  if (action.type === 'up') { s.pressed = false; if (entry.interaction === 'drag') { if (entry.kind === 'sheet') { s.from=sampleState(s,t).v;s.at=t;s.value = Math.round(s.value * 2) / 2; } return; } }
  if (action.type === 'text') { s.from=sampleState(s,t).v;s.at=t;s.text = String(action.text ?? '');s.value=s.text?1:0; s.manual = true; s.outcome=''; return; }
  const previousIndex=sampleState(s,t).position;
  if (action.type === 'key') {
    s.manual = true; const point=[clamp(x + (action.dx || 0) * .04), clamp(y + (action.dy || 0) * .04)];remember(...point);s.pointer=point;
    if (entry.interaction === 'pointer') return;
    if (entry.kind === 'slider' || entry.kind === 'largetitle') { s.from = s.value; s.value = clamp(s.value + (action.dx || -action.dy || 0) * .05); s.at = t; return; }
    s.selected = (s.selected + (action.dx || action.dy || 1) + 12) % 3;
  }
  if (entry.kind === 'loading' && s.manual && t - s.at < 3.6) return;
  s.from = sampleState(s, t).v; s.fromIndex=previousIndex; s.fromBits=s.bits; s.manual = true; s.at = t;
  if (entry.interaction === 'drag') s.value = entry.kind === 'sheet' ? clamp((.9 - y) / .7) : clamp((x - .16) / .68);
  else s.value = s.value > .5 ? 0 : 1;
  const horizontal = ['button','nav','tabs','segment','chip','toolbar','commandbar','pagedots','stepper','split','parent'].includes(entry.kind);
  if (action.type === 'up' || action.type === 'move' || action.type === 'down') s.selected = horizontal ? clamp(Math.floor((x - .12) / .25), 0, 2) : clamp(Math.floor((y - .24) / .205), 0, 2);
  if (action.type !== 'key' && ['pages','wheel','wipes','infobar','morph'].includes(entry.kind)) s.selected = (s.selected + (entry.kind==='pages'&&action.type==='up'&&x<.5?2:1)) % 3;
  if (entry.kind === 'stepper') s.count += action.type==='key' ? (action.dx||action.dy||1) : x < .5 ? -1 : 1; else s.count++;
  if (action.type!=='key' && ['switch','check','chip','parent'].includes(entry.kind)) s.bits ^= 1 << s.selected;
  if (['alert','actions','combo','context','dialog','pagesheet'].includes(entry.kind) && s.value===0) s.outcome = ['alert','dialog','pagesheet'].includes(entry.kind)?x<.5?'Cancelled':'Confirmed':['A','B','C'][clamp(Math.floor((y-.48)/.093),0,2)];
  if (entry.kind==='split') {if(x<.64&&action.type!=='key'){s.value=0;s.outcome='Published';}else s.outcome='Choose an action';}
  if (['input','search','palette'].includes(entry.kind)) {const matches=['Create project','Open library','Change theme'].filter(str=>str.toLowerCase().includes(s.text.toLowerCase()));s.outcome=entry.kind==='input'?s.text? 'Saved: '+s.text:'Enter a name':matches[s.selected%matches.length]||'No matches';}
  s.events.push({ x, y, t }); s.events = s.events.slice(-8);
}
