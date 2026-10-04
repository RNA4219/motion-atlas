// Copyright (c) 2026 Motion Atlas contributors — MIT License.
import {hash} from './math.js';
export function eccentricAnomaly(mean,e){let a=mean;for(let i=0;i<12;i++)a-=(a-e*Math.sin(a)-mean)/(1-e*Math.cos(a));return a;}
export function poissonPoints(distance,attempts,width=520,height=250,seed=17){
  const points=[];
  for(let i=0;i<attempts;i++){const p=[hash(i,seed)*width,hash(i,seed+1)*height];if(points.every(q=>Math.hypot(q[0]-p[0],q[1]-p[1])>=distance))points.push(p);}
  return points;
}
export function delaunayTriangles(points){
  const triangles=[];
  for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++)for(let k=j+1;k<points.length;k++){
    const [ax,ay]=points[i],[bx,by]=points[j],[cx,cy]=points[k],d=2*(ax*(by-cy)+bx*(cy-ay)+cx*(ay-by));if(Math.abs(d)<1e-7)continue;
    const aa=ax*ax+ay*ay,bb=bx*bx+by*by,cc=cx*cx+cy*cy;
    const ux=(aa*(by-cy)+bb*(cy-ay)+cc*(ay-by))/d,uy=(aa*(cx-bx)+bb*(ax-cx)+cc*(bx-ax))/d,r2=(ux-ax)**2+(uy-ay)**2;
    if(points.every(([x,y],n)=>n===i||n===j||n===k||(x-ux)**2+(y-uy)**2>=r2-1e-6))triangles.push([i,j,k]);
  }
  return triangles;
}
export function lifeGeneration(cells,width,height){
  const next=new Uint8Array(cells.length);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    let n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(dx||dy)n+=cells[((y+dy+height)%height)*width+(x+dx+width)%width];
    const i=y*width+x;next[i]=n===3||(cells[i]&&n===2)?1:0;
  }
  return next;
}
export function solveGrid(cells,width,height,start=0,end=cells.length-1){
  const open=new Set([start]),cost=new Map([[start,0]]),from=new Map(),visited=[];
  const heuristic=i=>Math.abs(i%width-end%width)+Math.abs(Math.floor(i/width)-Math.floor(end/width));
  while(open.size){let current=[...open].reduce((a,b)=>cost.get(a)+heuristic(a)<=cost.get(b)+heuristic(b)?a:b);open.delete(current);visited.push(current);
    if(current===end){const path=[end];while(from.has(path[0]))path.unshift(from.get(path[0]));return{path,visited};}
    const x=current%width,y=Math.floor(current/width);
    for(const [nx,ny] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]])if(nx>=0&&nx<width&&ny>=0&&ny<height){const n=ny*width+nx,c=cost.get(current)+1;if(!cells[n]&&c<(cost.get(n)??Infinity)){cost.set(n,c);from.set(n,current);open.add(n);}}
  }
  return{path:[],visited};
}
export function constrainedRope(segments,gravity,steps){
  const length=240/segments,points=Array.from({length:segments+1},(_,i)=>({x:170+i*length,y:90,px:170+i*length,py:90}));
  for(let n=0;n<steps;n++){
    for(let i=1;i<points.length;i++){const p=points[i],x=p.x,y=p.y;p.x+=(p.x-p.px)*.995;p.y+=(p.y-p.py)*.995+gravity;p.px=x;p.py=y;}
    for(let k=0;k<12;k++){points[0].x=170;points[0].y=90;for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,f=(d-length)/d;if(i>1){a.x+=dx*f*.5;a.y+=dy*f*.5;b.x-=dx*f*.5;b.y-=dy*f*.5;}else{b.x-=dx*f;b.y-=dy*f;}}}
  }
  return points.map(p=>[p.x,p.y]);
}
const trajectoryCache=new Map();
export function attractorPoints(kind,coefficient,count){
  const key=[kind,coefficient,count].join(':');if(trajectoryCache.has(key))return trajectoryCache.get(key);
  let x=.1,y=.2,z=.1;const points=[],dt=kind==='lorenz'?.007:.03;
  for(let i=0;i<count+500;i++){
    let dx,dy,dz;if(kind==='lorenz'){dx=10*(y-x);dy=x*(coefficient-z)-y;dz=x*y-8/3*z;}else{dx=-y-z;dy=x+.2*y;dz=.2+z*(x-coefficient);}
    x+=dx*dt;y+=dy*dt;z+=dz*dt;if(i>=500)points.push([x,y,z]);
  }
  if(trajectoryCache.size>=20)trajectoryCache.delete(trajectoryCache.keys().next().value);trajectoryCache.set(key,points);return points;
}
