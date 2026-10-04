// Copyright (c) 2026 Motion Atlas contributors — MIT License.
// 比較中は可視範囲にかかわらず、左右へ同じ時刻を渡す。
export function createComparisonClock(onTick,{request=requestAnimationFrame,cancel=cancelAnimationFrame,isVisible=()=>!document.hidden}={}){
  let time=0,running=false,frameId=0,previous=null;
  const schedule=()=>{if(running&&isVisible()&&!frameId)frameId=request(frame);};
  function frame(now){
    frameId=0;if(!running||!isVisible()){previous=null;return;}
    if(previous!==null)time+=Math.max(0,Math.min((now-previous)/1000,.07));
    previous=now;onTick(time);schedule();
  }
  function stopFrame(){cancel(frameId);frameId=0;previous=null;}
  return{
    get time(){return time;},get running(){return running;},
    play(){running=true;schedule();},
    pause(){running=false;stopFrame();},
    seek(value){if(!Number.isFinite(value))throw new TypeError('時刻は数値で指定');time=Math.max(0,value);previous=null;onTick(time);},
    visibilityChanged(){stopFrame();schedule();},
    destroy(){running=false;stopFrame();}
  };
}
