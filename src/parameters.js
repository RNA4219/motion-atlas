// Copyright (c) 2026 Motion Atlas contributors — MIT License.
const numeric=(key,label,min,max,value,step=.01)=>({key,label,min,max,default:value,step});
const legacyParameters={
  spring:[numeric('damping','中央の減衰比',.1,2,.75),numeric('frequency','角周波数',2,15,7,.1)],
  secondorder:[numeric('damping','減衰比',.1,2,.55),numeric('frequency','角周波数',2,15,7,.1)],
  follow:[numeric('frequency','角周波数',2,15,7,.1)],
  hermite:[numeric('tangent','接線の倍率',.2,1.5,1)],
  wavefield:[numeric('wavelength','波の空間周波数',.02,.15,.066,.001)],
  dock:[numeric('reach','拡大の半径',60,220,130,1)],
  ripple:[numeric('spread','波の速度',80,320,200,1)],
};
export function parameterSpecs(entry){return [...(entry.parameters||legacyParameters[entry.kind]||[]),numeric('scale','表示倍率',.65,1.25,1,.01)];}
export function defaultParameters(entry){return Object.fromEntries(parameterSpecs(entry).map(p=>[p.key,p.default]));}
export function normalizeParameters(entry,values={}){
  if(!values||typeof values!=='object'||Array.isArray(values))throw new TypeError('パラメータはオブジェクトで指定してください');
  const result=defaultParameters(entry);
  for(const spec of parameterSpecs(entry))if(Object.hasOwn(values,spec.key)){
    const value=values[spec.key];if(typeof value!=='number'||!Number.isFinite(value))throw new TypeError(spec.label+'は有限の数値で指定してください');
    result[spec.key]=Math.min(spec.max,Math.max(spec.min,spec.step===1?Math.round(value):value));
  }
  return result;
}
export function parsePreset(raw,lookup){
  const data=typeof raw==='string'?JSON.parse(raw):raw;
  if(!data||data.version!==1||typeof data.demo!=='string'||!lookup.has(data.demo))throw new Error('対応するデモのプリセットではありません');
  const entry=lookup.get(data.demo),params=normalizeParameters(entry,data.params);
  for(const [name,min,max] of [['speed',.1,3],['strength',0,1.5],['time',0,86400]])if(!Number.isFinite(data[name])||data[name]<min||data[name]>max)throw new Error(name+'が範囲外です');
  if(data.accent!=null&&!/^#[0-9a-f]{6}$/i.test(data.accent))throw new Error('色の形式が不正です');
  return{version:1,demo:entry.id,params,speed:data.speed,strength:data.strength,time:data.time,accent:data.accent||null};
}
export function mountParameters(container,player,onChange=()=>{}){
  container.replaceChildren();
  for(const spec of parameterSpecs(player.entry)){
    const label=document.createElement('label'),caption=document.createElement('span'),input=document.createElement('input'),out=document.createElement('output');
    caption.textContent=spec.label;input.type='range';input.min=spec.min;input.max=spec.max;input.step=spec.step;input.value=player.parameters[spec.key];input.setAttribute('aria-label',spec.label);out.textContent=input.value;
    input.addEventListener('input',()=>{player.setParameter(spec.key,Number(input.value));out.textContent=input.value;onChange();});label.append(caption,input,out);container.append(label);
  }
  const label=document.createElement('label'),caption=document.createElement('span'),input=document.createElement('input');caption.textContent='主役の色';input.type='color';input.value=player.preset().accent||'#c5f477';input.setAttribute('aria-label','主役の色');input.addEventListener('input',()=>{player.setAccent(input.value);onChange();});label.append(caption,input);container.append(label);
}
export function downloadPreset(player){
  const url=URL.createObjectURL(new Blob([JSON.stringify(player.preset(),null,2)+'\n'],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=player.entry.id+'-preset.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
