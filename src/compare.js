// Copyright (c) 2026 Motion Atlas contributors — MIT License.
import {catalog} from './catalog.js';
import {createPlayer} from './player.js';
import {mountParameters,downloadPreset} from './parameters.js';
import {createComparisonClock} from './compare-clock.js';
export function createComparison(dialog,onOpen,onClose){
  const panels=['left','right'].map(side=>dialog.querySelector(`[data-side="${side}"]`)),players=[null,null];
  const play=dialog.querySelector('[data-compare-play]'),seek=dialog.querySelector('[data-compare-time]'),output=dialog.querySelector('output[data-clock]');let lastReadout=-1;
  const clock=createComparisonClock(time=>{
    players.forEach(p=>clock.running?p?.syncTime(time):p?.seek(time));
    if(Math.abs(time-lastReadout)>.08||!clock.running){lastReadout=time;output.textContent=(time%8).toFixed(2)+' s';if(document.activeElement!==seek)seek.value=time%8;}
  });
  function load(i){
    players[i]?.destroy();const panel=panels[i],id=panel.querySelector('select').value;
    players[i]=createPlayer(panel.querySelector('canvas'),id,{autoplay:false,clockRunning:()=>clock.running});
    players[i].seek(clock.time);mountParameters(panel.querySelector('.parameter-controls'),players[i]);
  }
  panels.forEach((panel,i)=>{
    const select=panel.querySelector('select');catalog.forEach(e=>{const option=document.createElement('option');option.value=e.id;option.textContent=e.label+' / '+e.title;select.append(option);});select.value='spring';select.addEventListener('change',()=>load(i));
    panel.querySelector('[data-export]').addEventListener('click',()=>downloadPreset(players[i]));
  });
  function setRunning(value){if(value)clock.play();else{clock.pause();clock.seek(clock.time);}play.textContent=value?'両方を停止':'両方を再生';}
  play.addEventListener('click',()=>setRunning(!clock.running));
  seek.addEventListener('input',()=>{setRunning(false);clock.seek(Number(seek.value));});
  dialog.querySelector('[data-compare-reset]').addEventListener('click',()=>{players.forEach(p=>p.reset());lastReadout=-1;clock.seek(0);});
  dialog.querySelector('[data-close-compare]').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{setRunning(false);players.forEach(p=>p?.destroy());players.fill(null);document.body.style.overflow='';onClose();});
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const reduced=()=>{if(media.matches)setRunning(false);};
  const visibility=()=>clock.visibilityChanged();
  media.addEventListener('change',reduced);document.addEventListener('visibilitychange',visibility);
  return{
    open(){onOpen();clock.seek(0);lastReadout=-1;dialog.showModal();document.body.style.overflow='hidden';load(0);load(1);if(players[1].entry.id==='spring')players[1].setParameter('damping',1.2);mountParameters(panels[1].querySelector('.parameter-controls'),players[1]);setRunning(!media.matches);},
    destroy(){clock.destroy();players.forEach(p=>p?.destroy());media.removeEventListener('change',reduced);document.removeEventListener('visibilitychange',visibility);}
  };
}
