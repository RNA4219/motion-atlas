// Copyright (c) 2026 Motion Atlas contributors — MIT License.
import {catalog,byId,categoryNames,familyNames,searchEntries,explain} from './catalog.js';
import {createPlayer} from './player.js';
import {mountParameters,parsePreset,downloadPreset} from './parameters.js';
import {createComparison} from './compare.js';
const $=id=>document.getElementById(id),dialog=$('detail');
let favorites=new Set(),category='all',onlyFavorites=false,filtered=catalog,previews=[],player=null,current=null,returnFocus=null,noticeTimer=0;
let previewsPaused=matchMedia('(prefers-reduced-motion: reduce)').matches;
let onlyNew=false;
try{const stored=JSON.parse(localStorage.getItem('motion-atlas-favorites')||'[]');if(Array.isArray(stored))favorites=new Set(stored.filter(id=>byId.has(id)));}catch{}
function message(str){clearTimeout(noticeTimer);$('toast').textContent=str;$('toast').classList.add('shown');noticeTimer=setTimeout(()=>$('toast').classList.remove('shown'),2500);}
function persist(){try{localStorage.setItem('motion-atlas-favorites',JSON.stringify([...favorites]));}catch{message('お気に入りはこの画面を開いている間だけ保存します');}}
function toggleFavorite(id){favorites.has(id)?favorites.delete(id):favorites.add(id);persist();refreshStars();if(onlyFavorites)filter();}
function refreshStars(){document.querySelectorAll('[data-favorite]').forEach(b=>{const on=favorites.has(b.dataset.favorite);b.textContent=on?'★':'☆';b.setAttribute('aria-pressed',String(on));b.setAttribute('aria-label',`${byId.get(b.dataset.favorite).label}をお気に入り${on?'から削除':'に追加'}`);});if(current){const on=favorites.has(current.id);$('detail-favorite').textContent=on?'★':'☆';$('detail-favorite').setAttribute('aria-pressed',String(on));$('detail-favorite').setAttribute('aria-label',on?'お気に入りから削除':'お気に入りに追加');}}
for(const [id,name] of Object.entries(familyNames)){const opt=document.createElement('option');opt.value=id;opt.textContent=name;$('family').append(opt);}
const cardMap=new Map();
for(const [i,e] of catalog.entries()){
  const card=document.createElement('article');card.className='card';card.dataset.id=e.id;
  const button=document.createElement('button');button.className='card-open';button.setAttribute('aria-label',e.label+'のデモを開く');
  button.innerHTML=`<canvas aria-hidden="true"></canvas><div class="card-meta"><span class="card-name">${e.title}</span><span class="card-number">${String(i+1).padStart(3,'0')}</span></div><p class="card-description">${e.label} <span aria-hidden="true">·</span> ${e.group}</p>`;
  button.addEventListener('click',()=>openDetail(e.id,true,button));card.append(button);
  if(e.added){const tag=document.createElement('span');tag.className='new-tag';tag.textContent='NEW / LAB';card.append(tag);}
  const star=document.createElement('button');star.className='card-star';star.dataset.favorite=e.id;star.addEventListener('click',()=>toggleFavorite(e.id));card.append(star);$('cards').append(card);cardMap.set(e.id,card);
  previews.push(createPlayer(card.querySelector('canvas'),e,{preview:true,autoplay:!previewsPaused}));
}
const hero=createPlayer($('hero-canvas'),'spring',{preview:true,autoplay:!previewsPaused});
$('hero-toggle').addEventListener('click',()=>{hero.playing?hero.pause():hero.play();$('hero-toggle').textContent=hero.playing?'Ⅱ':'▷';$('hero-toggle').setAttribute('aria-label',hero.playing?'表紙のアニメーションを停止':'表紙のアニメーションを再生');});
function filter(){filtered=searchEntries({query:$('search').value,category,family:$('family').value,favorites:onlyFavorites?favorites:null}).filter(e=>!onlyNew||e.added);const ids=new Set(filtered.map(e=>e.id));for(const [id,card] of cardMap)card.hidden=!ids.has(id);$('empty').hidden=filtered.length>0;$('result-count').textContent=filtered.length+'件';$('heading-count').textContent=filtered.length;}
document.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.category;document.querySelectorAll('[data-category]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});filter();}));
$('search').addEventListener('input',filter);$('family').addEventListener('change',filter);
$('new-only').addEventListener('click',()=>{onlyNew=!onlyNew;$('new-only').setAttribute('aria-pressed',String(onlyNew));filter();});
$('favorites-only').addEventListener('click',()=>{onlyFavorites=!onlyFavorites;$('favorites-only').setAttribute('aria-pressed',String(onlyFavorites));filter();});
$('clear-filters').addEventListener('click',()=>{$('search').value='';$('family').value='all';category='all';onlyFavorites=false;onlyNew=false;$('new-only').setAttribute('aria-pressed','false');$('favorites-only').setAttribute('aria-pressed','false');document.querySelectorAll('[data-category]').forEach(b=>{const on=b.dataset.category==='all';b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});filter();});
function setPreviews(){previews.forEach(p=>previewsPaused||dialog.open?p.pause():p.play());$('global-play').textContent=previewsPaused?'プレビューを再生':'プレビューを停止';$('global-play').setAttribute('aria-pressed',String(previewsPaused));}
$('global-play').addEventListener('click',()=>{previewsPaused=!previewsPaused;setPreviews();});
function setTab(which){for(const name of ['guide','code']){const active=name===which;$(`${name}-tab`).setAttribute('aria-selected',String(active));$(`${name}-tab`).tabIndex=active?0:-1;$(`${name}-panel`).hidden=!active;}}
for(const name of ['guide','code']){$(`${name}-tab`).addEventListener('click',()=>setTab(name));$(`${name}-tab`).addEventListener('keydown',ev=>{if(['ArrowRight','ArrowLeft'].includes(ev.key)){ev.preventDefault();const other=name==='guide'?'code':'guide';setTab(other);$(`${other}-tab`).focus();}});}
function openDetail(id,push=false,opener=null){
  const e=byId.get(id);if(!e)return;const wasOpen=dialog.open;player?.destroy();current=e;
  if(opener)returnFocus=opener;
  $('detail-title').textContent=e.title;$('detail-category').textContent=categoryNames[e.category]+' / '+e.group;$('detail-number').textContent=`${catalog.indexOf(e)+1} / ${catalog.length}`;
  const docs=explain(e);$('interaction-hint').textContent=docs.controls;
  $('guide-panel').innerHTML=`<p class="lead"></p><h3>動きの仕組み</h3><p data-mechanism></p><h3>調整のヒント</h3><ul></ul><h3>プロジェクトに組み込む</h3><p data-integration></p>`;
  $('guide-panel').querySelector('.lead').textContent=docs.purpose;$('guide-panel').querySelector('[data-mechanism]').textContent=docs.mechanism;$('guide-panel').querySelector('[data-integration]').textContent=docs.integration;
  for(const tip of docs.tuning){const li=document.createElement('li');li.textContent=tip;$('guide-panel').querySelector('ul').append(li);}
  $('api-code').textContent=`import { createPlayer } from './src/player.js';\n\nconst canvas = document.querySelector('canvas');\nconst demo = createPlayer(canvas, '${e.id}');\ndemo.setSpeed(1);\ndemo.setStrength(1);\n\n// 画面を破棄するとき\n// demo.destroy();`;
  $('source-link').href=`src/${e.added?'lab-'+(e.category==='movie'?'cinema':e.category==='game'?'systems':'ui'):e.category==='movie'?'cinema':e.category==='game'?'systems':['soft','precision','tactile'].includes(e.family)?'controls':'motion'}.js`;
  $('download-html').href=`samples/${e.id}.html`;$('download-zip').href=`downloads/${e.id}.zip`;
  $('text-input-row').hidden=e.interaction!=='text';$('demo-text').value='';$('speed').value='1';$('strength').value='1';$('strength-output').textContent='100%';$('timeline').max=e.duration;
  setTab('guide');if(!wasOpen)dialog.showModal();document.body.style.overflow='hidden';
  let lastUpdate=-1,lastPlaying=null;
  player=createPlayer($('demo-canvas'),e,{onFrame:info=>{const local=info.time%e.duration;if(Math.abs(info.time-lastUpdate)<.075&&lastUpdate>=0&&lastPlaying===info.playing)return;lastUpdate=info.time;lastPlaying=info.playing;$('time-output').textContent=local.toFixed(2)+' s';if(document.activeElement!==$('timeline'))$('timeline').value=local;$('toggle-play').textContent=info.playing?'Ⅱ':'▷';$('toggle-play').setAttribute('aria-label',info.playing?'再生を停止':'再生を開始');}});
  mountParameters($('parameter-controls'),player,refreshCode);refreshCode();
  if(push)history[wasOpen?'replaceState':'pushState'](null,'',`#demo=${encodeURIComponent(id)}`);
  refreshStars();setPreviews();hero.pause();
}
function finishClose(){player?.destroy();player=null;current=null;document.body.style.overflow='';setPreviews();if(!previewsPaused)hero.play();if(location.hash.startsWith('#demo='))history.replaceState(null,'','#library');returnFocus?.focus({preventScroll:true});}
$('close-detail').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',finishClose);
dialog.addEventListener('click',ev=>{if(ev.target!==dialog)return;const r=dialog.getBoundingClientRect();if(ev.clientX<r.left||ev.clientX>r.right||ev.clientY<r.top||ev.clientY>r.bottom)dialog.close();});
$('detail-favorite').addEventListener('click',()=>current&&toggleFavorite(current.id));
$('toggle-play').addEventListener('click',()=>{if(player){player.playing?player.pause():player.play();$('toggle-play').textContent=player.playing?'Ⅱ':'▷';}});
$('reset-demo').addEventListener('click',()=>{player?.reset();$('demo-text').value='';});$('activate-demo').addEventListener('click',()=>player?.activate());
$('timeline').addEventListener('input',()=>{player?.pause();player?.seek(Number($('timeline').value));$('time-output').textContent=Number($('timeline').value).toFixed(2)+' s';});
$('speed').addEventListener('change',()=>player?.setSpeed(Number($('speed').value)));$('strength').addEventListener('input',()=>{player?.setStrength(Number($('strength').value));$('strength-output').textContent=Math.round(Number($('strength').value)*100)+'%';});
$('demo-text').addEventListener('input',()=>player?.setText($('demo-text').value));$('demo-text').addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();player?.activate();}});$('text-submit').addEventListener('click',()=>player?.activate());
function step(delta){if(!current)return;const list=filtered.some(e=>e.id===current.id)?filtered:catalog;const i=list.findIndex(e=>e.id===current.id);openDetail(list[(i+delta+list.length)%list.length].id,true);}
$('previous-demo').addEventListener('click',()=>step(-1));$('next-demo').addEventListener('click',()=>step(1));
async function copy(value){try{await navigator.clipboard.writeText(value);message('コピーしました');}catch{message('コピーできませんでした。表示テキストを選択してコピーしてください');}}
$('copy-link').addEventListener('click',()=>copy(location.href));$('copy-code').addEventListener('click',()=>copy($('api-code').textContent));
document.addEventListener('keydown',ev=>{if(ev.key==='/'&&!dialog.open&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){ev.preventDefault();$('search').focus();}});
function route(){if(location.hash.startsWith('#demo=')){try{const id=decodeURIComponent(location.hash.slice(6));if(byId.has(id)&&current?.id!==id)openDetail(id);}catch{}}else if(dialog.open)dialog.close();}
window.addEventListener('popstate',route);window.addEventListener('hashchange',route);
window.addEventListener('pagehide',()=>{player?.destroy();hero.destroy();previews.forEach(p=>p.destroy());comparison.destroy();});
window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
function refreshCode(){if(!player)return;const data=player.preset();$('api-code').textContent=`import { createPlayer } from './src/player.js';\nconst demo = createPlayer(document.querySelector('canvas'), '${current.id}', {\n  params: ${JSON.stringify(data.params,null,2)}\n});\ndemo.setSpeed(${data.speed});\ndemo.setStrength(${data.strength});\n${data.accent?`demo.setAccent('${data.accent}');\n`:''}// 画面を破棄するとき: demo.destroy();`;}
function syncPresetControls(){const data=player.preset();mountParameters($('parameter-controls'),player,refreshCode);if(![...$('speed').options].some(o=>Number(o.value)===data.speed)){const opt=document.createElement('option');opt.value=data.speed;opt.textContent=data.speed+'×';$('speed').append(opt);}$('speed').value=data.speed;$('strength').value=data.strength;$('strength-output').textContent=Math.round(data.strength*100)+'%';refreshCode();}
$('preset-save').addEventListener('click',()=>{try{localStorage.setItem('motion-atlas-preset-'+current.id,JSON.stringify(player.preset()));message('このデモの設定を保存しました');}catch{message('このブラウザでは保存できません。JSONを書き出せます');}});
$('preset-load').addEventListener('click',()=>{try{const raw=localStorage.getItem('motion-atlas-preset-'+current.id);if(!raw){message('保存した設定がありません');return;}player.loadPreset(raw);syncPresetControls();message('保存した設定を読み込みました');}catch{message('設定を読み込めませんでした');}});
$('preset-export').addEventListener('click',()=>downloadPreset(player));
$('preset-import-button').addEventListener('click',()=>$('preset-import').click());
$('parameters-reset').addEventListener('click',()=>{player.resetParameters();syncPresetControls();});
$('preset-import').addEventListener('change',async event=>{const file=event.target.files?.[0];try{if(!file)return;if(file.size>65536)throw new Error('設定ファイルが大きすぎます');const data=parsePreset(await file.text(),byId);if(current.id!==data.demo)openDetail(data.demo,true);player.loadPreset(data);syncPresetControls();message('設定を読み込みました');}catch(error){message(error.message);}finally{event.target.value='';}});
const comparison=createComparison($('comparison'),()=>{hero.pause();previews.forEach(p=>p.pause());},()=>{setPreviews();if(!previewsPaused)hero.play();});
$('open-compare').addEventListener('click',()=>comparison.open());
$('speed').addEventListener('change',refreshCode);$('strength').addEventListener('input',refreshCode);
refreshStars();filter();setPreviews();route();
