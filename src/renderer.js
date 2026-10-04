// Copyright (c) 2026 Motion Atlas contributors — MIT License.
import { palettes, paletteFor, rect } from './drawing.js';
import { controlKinds, renderControl } from './controls.js';
import { motionKinds, renderMotion } from './motion.js';
import { cinemaKinds, renderCinema } from './cinema.js';
import { systemKinds, renderSystem } from './systems.js';
import {labUIKinds,renderLabUI} from './lab-ui.js';
import {labCinemaKinds,renderLabCinema} from './lab-cinema.js';
import {labSystemKinds,renderLabSystem} from './lab-systems.js';
import {normalizeParameters} from './parameters.js';
export const implementedKinds = new Set([...controlKinds,...motionKinds,...cinemaKinds,...systemKinds,...labUIKinds,...labCinemaKinds,...labSystemKinds]);
export function render(g,entry,t,state,options={}) {
  if(!Number.isFinite(t))throw new TypeError('時刻は有限の数値で指定してください');
  const opts={strength:1,preview:false,...options,params:normalizeParameters(entry,options.params)},p={...paletteFor(entry)};
  if(/^#[0-9a-f]{6}$/i.test(options.accent||''))p.accent=options.accent;
  g.save();
  try {
    g.setTransform(g.canvas.width/640,0,0,g.canvas.height/400,0,0);
    g.globalAlpha=1;g.globalCompositeOperation='source-over';g.lineWidth=2;g.lineCap='round';g.lineJoin='round';g.setLineDash([]);g.shadowBlur=0;g.filter='none';
    rect(g,0,0,640,400,0,p.bg);
    const zoom=opts.params.scale;g.translate(320,200);g.scale(zoom,zoom);g.translate(-320,-200);
    if(controlKinds.has(entry.kind))renderControl(g,entry,t,state,opts,p);
    else if(motionKinds.has(entry.kind))renderMotion(g,entry,t,state,opts,p);
    else if(cinemaKinds.has(entry.kind))renderCinema(g,entry,t,state,opts,p);
    else if(systemKinds.has(entry.kind))renderSystem(g,entry,t,state,opts,p);
    else if(labUIKinds.has(entry.kind))renderLabUI(g,entry,t,state,opts,p);
    else if(labCinemaKinds.has(entry.kind))renderLabCinema(g,entry,t,state,opts,p);
    else if(labSystemKinds.has(entry.kind))renderLabSystem(g,entry,t,state,opts,p);
    else throw new Error('未実装のデモ: '+entry.id);
    if(entry.added){g.font='12px "Segoe UI", sans-serif';g.fillStyle=p.muted;g.textAlign='left';g.fillText(entry.title.toUpperCase(),34,35);g.textAlign='right';g.fillText('LAB / '+t.toFixed(2)+' s',606,373);}
  } finally {g.restore();}
}
