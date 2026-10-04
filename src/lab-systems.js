// Copyright (c) 2026 Motion Atlas contributors — MIT License.
import {TAU,clamp,phase,hash} from './math.js';
import {rect,circle,text,line,polygon} from './drawing.js';
import {eccentricAnomaly,poissonPoints,delaunayTriangles,lifeGeneration,solveGrid,constrainedRope,attractorPoints} from './lab-math.js';
export const labSystemKinds=new Set('pendulum newton-cradle projectile orbital-gravity lissajous spirograph rose-curve superformula lorenz-attractor rossler-attractor flocking voronoi-drift delaunay-mesh poisson-disk metaballs verlet-rope cloth-grid double-pendulum game-of-life sandpile astar-search pendulum-wave'.split(' '));
const labCache=new Map();
function labRemember(key,build){if(labCache.has(key))return labCache.get(key);const value=build();if(labCache.size>=32)labCache.delete(labCache.keys().next().value);labCache.set(key,value);return value;}
function labSites(count,t,amount){return Array.from({length:Math.round(count)},(_,i)=>[83+hash(i,21)*474+Math.sin(t*.5+i)*amount,91+hash(i,49)*225+Math.cos(t*.7+i)*amount*.6]);}
export function renderLabSystem(g,e,t,s,o,p){
  const a=o.params,words=(str,x=320,y=335)=>text(g,str,x,y,15,p.muted,'center');
  switch(e.kind){
    case 'pendulum':{
      const angle=Math.cos(t*Math.sqrt(a.gravity/a.length))*.75,end=[320+Math.sin(angle)*a.length,83+Math.cos(angle)*a.length];line(g,[[180,79],[460,79]],p.line,4);line(g,[[320,83],end],p.ink,2);circle(g,...end,17,p.accent);circle(g,320,83,5,p.secondary);words('T = '+(TAU*Math.sqrt(a.length/a.gravity)).toFixed(2)+' s');break;
    }
    case 'newton-cradle':{
      const n=Math.round(a.balls),start=320-(n-1)*36/2,angle=Math.sin(t*2)*a.angle;line(g,[[start-30,89],[start+(n-1)*36+30,89]],p.line,4);for(let i=0;i<n;i++){const swing=i===0?Math.min(0,angle):i===n-1?Math.max(0,angle):0,x=start+i*36,y=93,end=[x+Math.sin(swing)*155,y+Math.cos(swing)*155];line(g,[[x,y],end],p.ink,1);circle(g,...end,18,i===0||i===n-1?p.accent:p.secondary);}words('idealized energy transfer');break;
    }
    case 'projectile':{
      const rad=a.angle*Math.PI/180,vx=Math.cos(rad)*a.speed,vy=Math.sin(rad)*a.speed,gravity=90,total=2*vy/gravity,time=phase(t,total)*total,points=Array.from({length:61},(_,i)=>{const u=i/60*total;return[80+vx*u,300-vy*u+gravity*u*u/2];});line(g,[[70,304],[590,304]],p.line,2);line(g,points,p.line,2);circle(g,80+vx*time,300-vy*time+gravity*time*time/2,12,p.accent);words('vx '+vx.toFixed(0)+' / flight '+total.toFixed(2)+' s');break;
    }
    case 'orbital-gravity':{
      const b=a.radius*Math.sqrt(1-a.eccentricity*a.eccentricity),E=eccentricAnomaly(t,a.eccentricity),points=Array.from({length:121},(_,i)=>[320+a.radius*Math.cos(i/120*TAU),200+b*.6*Math.sin(i/120*TAU)]);line(g,points,p.line,2);circle(g,320+a.radius*a.eccentricity,200,15,p.secondary);circle(g,320+a.radius*Math.cos(E),200+b*.6*Math.sin(E),10,p.accent);break;
    }
    case 'lissajous':{
      const points=Array.from({length:361},(_,i)=>{const u=i/360*TAU;return[320+210*Math.sin(a.a*u+t*.2),200+105*Math.sin(a.b*u)];});line(g,points,p.accent,2);words(`${a.a} : ${a.b}`);break;
    }
    case 'spirograph':{
      const R=95,r=R/a.ratio,points=Array.from({length:650},(_,i)=>{const u=i/649*TAU*8+t*.12;return[320+(R-r)*Math.cos(u)+a.offset*Math.cos((R-r)/r*u),200+(R-r)*Math.sin(u)-a.offset*Math.sin((R-r)/r*u)];});line(g,points,p.accent,1.5);break;
    }
    case 'rose-curve':{
      const points=Array.from({length:501},(_,i)=>{const angle=i/500*TAU,r=a.radius*Math.cos(a.petals*angle);return[320+Math.cos(angle+t*.16)*r,200+Math.sin(angle+t*.16)*r];});line(g,points,p.accent,2);break;
    }
    case 'superformula':{
      const n=a.exponent,points=Array.from({length:401},(_,i)=>{const angle=i/400*TAU,r=Math.min(150,95*(Math.abs(Math.cos(a.symmetry*angle/4))**n+Math.abs(Math.sin(a.symmetry*angle/4))**n)**(-1/n));return[320+Math.cos(angle+t*.15)*r,200+Math.sin(angle+t*.15)*r];});line(g,points,p.accent,2);break;
    }
    case 'lorenz-attractor':case 'rossler-attractor':{
      const lorenz=e.kind==='lorenz-attractor',points=attractorPoints(lorenz?'lorenz':'rossler',lorenz?a.rho:a.c,Math.round(a.length)),rotation=t*.2,scale=lorenz?4.5:11,view=points.map(([x,y,z])=>[320+(x*Math.cos(rotation)+y*Math.sin(rotation))*scale,lorenz?315-z*scale:220+(y*Math.cos(rotation)-x*Math.sin(rotation))*scale*.55-z*2]);line(g,view,p.secondary,1.2);circle(g,...view.at(-1),4,p.accent);break;
    }
    case 'flocking':{
      const count=Math.round(a.count),steps=Math.floor(phase(t,8)*96),key=['flock',count,a.separation,steps].join(':');
      const birds=labRemember(key,()=>{let birds=Array.from({length:count},(_,i)=>({x:80+hash(i,31)*480,y:90+hash(i,91)*220,vx:Math.cos(i)*2,vy:Math.sin(i)*2}));
        for(let step=0;step<steps;step++)birds=birds.map((b,i)=>{let sx=0,sy=0,cx=0,cy=0,ax=0,ay=0,n=0;birds.forEach((c,j)=>{const dx=b.x-c.x,dy=b.y-c.y,d=Math.hypot(dx,dy);if(i!==j&&d<95){n++;cx+=c.x;cy+=c.y;ax+=c.vx;ay+=c.vy;if(d<32){sx+=dx/(d*d+.1);sy+=dy/(d*d+.1);}}});let vx=b.vx,vy=b.vy;if(n){vx+=sx*a.separation*3+(cx/n-b.x)*.0008+(ax/n-b.vx)*.04;vy+=sy*a.separation*3+(cy/n-b.y)*.0008+(ay/n-b.vy)*.04;}const speed=Math.hypot(vx,vy)||1;vx=vx/speed*2.4;vy=vy/speed*2.4;return{x:60+((b.x+vx-60+520)%520),y:80+((b.y+vy-80+240)%240),vx,vy};});return birds;});
      birds.forEach((b,i)=>polygon(g,b.x,b.y,6,3,Math.atan2(b.vy,b.vx),i%4?p.accent:p.secondary));break;
    }
    case 'voronoi-drift':{
      const sites=labSites(a.sites,t,a.motion),step=o.preview?14:9;
      for(let y=75;y<326;y+=step)for(let x=65;x<576;x+=step){let distance=Infinity,nearest=0;sites.forEach(([px,py],i)=>{const d=(px-x)**2+(py-y)**2;if(d<distance){distance=d;nearest=i;}});rect(g,x,y,step+.5,step+.5,0,`hsl(${(nearest*47+180)%360} 40% ${26+nearest%3*8}%)`);}sites.forEach(pt=>circle(g,...pt,3,p.ink));break;
    }
    case 'delaunay-mesh':{
      const sites=labSites(a.sites,t,a.motion);delaunayTriangles(sites).forEach(indices=>line(g,[...indices,indices[0]].map(i=>sites[i]),p.line,1.5));sites.forEach(pt=>circle(g,...pt,4,p.accent));break;
    }
    case 'poisson-disk':{
      const points=labRemember(['poisson',a.distance,a.attempts].join(':'),()=>poissonPoints(a.distance,Math.round(a.attempts))),visible=Math.floor((.2+phase(t,6)*.8)*points.length);points.slice(0,visible).forEach(([x,y])=>{circle(g,60+x,75+y,a.distance/2,null,p.line);circle(g,60+x,75+y,3,p.accent);});words(`${visible} accepted / min distance ${a.distance}`);break;
    }
    case 'metaballs':{
      const centers=Array.from({length:Math.round(a.balls)},(_,i)=>[320+Math.sin(t*.7+i*2)*145,200+Math.cos(t*.9+i)*76]),step=o.preview?9:6;
      for(let y=75;y<325;y+=step)for(let x=60;x<580;x+=step){const value=centers.reduce((v,[px,py])=>v+a.radius*a.radius/((x-px)**2+(y-py)**2+1),0);if(value>.85)rect(g,x,y,step+1,step+1,0,value>1.2?p.accent:p.secondary);}break;
    }
    case 'verlet-rope':{
      const pts=constrainedRope(Math.round(a.segments),a.gravity,Math.floor(phase(t,8)*100));line(g,pts,p.accent,4);pts.forEach((pt,i)=>circle(g,...pt,i?3:8,i?p.ink:p.secondary));break;
    }
    case 'cloth-grid':{
      const nx=10,ny=7,steps=Math.floor(phase(t,8)*72),key=['cloth',a.wind,a.stiffness,steps].join(':');
      const pts=labRemember(key,()=>{const pts=Array.from({length:nx*ny},(_,i)=>({x:190+i%nx*27,y:83+Math.floor(i/nx)*26,px:190+i%nx*27,py:83+Math.floor(i/nx)*26,pin:i===0||i===nx-1})),edges=[];for(let i=0;i<pts.length;i++){if(i%nx<nx-1)edges.push([i,i+1,27]);if(i<pts.length-nx)edges.push([i,i+nx,26]);}
        for(let k=0;k<steps;k++){pts.forEach((p,i)=>{if(p.pin)return;const x=p.x,y=p.y;p.x+=(p.x-p.px)*.96+Math.sin(k*.08+i*.03)*a.wind*.13;p.y+=(p.y-p.py)*.96+.13;p.px=x;p.py=y;});for(let n=0;n<a.stiffness;n++)for(const [i,j,length] of edges){const p=pts[i],q=pts[j],dx=q.x-p.x,dy=q.y-p.y,dist=Math.hypot(dx,dy)||1,weight=(dist-length)/dist*.5;if(!p.pin){p.x+=dx*weight;p.y+=dy*weight;}if(!q.pin){q.x-=dx*weight;q.y-=dy*weight;}}}return pts;});
      for(let y=0;y<ny;y++)line(g,pts.slice(y*nx,(y+1)*nx).map(p=>[p.x,p.y]),y%2?p.secondary:p.accent,1.5);for(let x=0;x<nx;x++)line(g,Array.from({length:ny},(_,y)=>[pts[y*nx+x].x,pts[y*nx+x].y]),p.line,1);circle(g,pts[0].x,pts[0].y,5,p.ink);circle(g,pts[nx-1].x,pts[nx-1].y,5,p.ink);break;
    }
    case 'double-pendulum':{
      let th1=a.angle,th2=a.angle*.7,w1=0,w2=0;const dt=.008,trace=[],steps=Math.floor(phase(t,8)*1000);let joint,end;
      for(let i=0;i<=steps;i++){const delta=th1-th2,den=3-Math.cos(2*delta),v1=(-3*a.gravity*Math.sin(th1)-a.gravity*Math.sin(th1-2*th2)-2*Math.sin(delta)*(w2*w2+w1*w1*Math.cos(delta)))/den,v2=2*Math.sin(delta)*(2*w1*w1+2*a.gravity*Math.cos(th1)+w2*w2*Math.cos(delta))/den;w1+=v1*dt;w2+=v2*dt;th1+=w1*dt;th2+=w2*dt;joint=[320+Math.sin(th1)*86,155+Math.cos(th1)*86];end=[joint[0]+Math.sin(th2)*86,joint[1]+Math.cos(th2)*86];if(i%4===0)trace.push(end);}
      line(g,trace.slice(-110),p.line,1.5);line(g,[[320,155],joint,end],p.accent,3);circle(g,...joint,9,p.secondary);circle(g,...end,13,p.accent);break;
    }
    case 'game-of-life':{
      const width=32,height=16,generation=Math.floor(phase(t,8)*8*a.rate),key=['life',a.density,generation].join(':');const cells=labRemember(key,()=>{let cells=Uint8Array.from({length:width*height},(_,i)=>hash(i,42)<a.density?1:0);for(let n=0;n<generation;n++)cells=lifeGeneration(cells,width,height);return cells;});cells.forEach((value,i)=>rect(g,64+i%width*16,77+Math.floor(i/width)*16,14,14,2,value?p.accent:p.panel));words('generation '+generation);break;
    }
    case 'sandpile':{
      const width=25,grains=Math.round(a.grains*(1+Math.floor(phase(t,8)*20))),key=['sand',grains,a.threshold].join(':');const cells=labRemember(key,()=>{const cells=new Uint16Array(width*width);cells[Math.floor(cells.length/2)]=grains;for(let pass=0;pass<2000;pass++){let changed=false;for(let i=0;i<cells.length;i++)if(cells[i]>=a.threshold){const count=Math.floor((cells[i]-a.threshold)/4)+1;cells[i]-=count*4;const x=i%width,y=Math.floor(i/width);if(x>0)cells[i-1]+=count;if(x<width-1)cells[i+1]+=count;if(y>0)cells[i-width]+=count;if(y<width-1)cells[i+width]+=count;changed=true;}if(!changed)break;}return cells;});cells.forEach((value,i)=>{if(value)rect(g,183+i%width*11,65+Math.floor(i/width)*11,10,10,1,[p.panel,p.line,p.secondary,p.accent,p.ink][Math.min(4,value)]);});words(grains+' grains');break;
    }
    case 'astar-search':{
      const width=26,height=13,key=['astar',a.obstacles,a.seed].join(':');const {cells,path,visited}=labRemember(key,()=>{const cells=Uint8Array.from({length:width*height},(_,i)=>i%width===0||Math.floor(i/width)===height-1?0:hash(i,Math.round(a.seed))<a.obstacles?1:0);return{cells,...solveGrid(cells,width,height)};});const reveal=Math.floor(phase(t,8)*visited.length*1.3),seen=new Set(visited.slice(0,reveal));cells.forEach((v,i)=>rect(g,60+i%width*20,72+Math.floor(i/width)*20,18,18,2,v?p.line:seen.has(i)?p.secondary:p.panel));if(reveal>=visited.length)line(g,path.map(i=>[69+i%width*20,81+Math.floor(i/width)*20]),p.accent,4);words(`${Math.min(reveal,visited.length)} explored / path ${path.length-1}`);break;
    }
    case 'pendulum-wave':{
      const count=Math.round(a.count),gap=500/(count-1);for(let i=0;i<count;i++){const x=70+i*gap,angle=Math.cos(t*(1+i*a.spread))*.55,end=[x+Math.sin(angle)*26,123+Math.cos(angle)*160];line(g,[[x,105],end],p.line,1);circle(g,...end,7,i%3?p.accent:p.secondary);}break;
    }
    default:throw new Error(e.kind);
  }
}
