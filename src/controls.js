// Copyright (c) 2026 Motion Atlas contributors — MIT License.
import { clamp, mix, phase, TAU, smooth, out } from './math.js';
import { rect, circle, text, line, label, checkmark, transform } from './drawing.js';
import { sampleState } from './state.js';

export const controlKinds = new Set('switch check radio button fab list chip slider linear spinner icon input search appbar nav tabs toast dialog sheet drawer menu tooltip card badge loading send palette parent flip commandbar navview infobar combo split pages teaching tree segment stepper pagedots wheel actions alert largetitle ticks pagesheet context toolbar'.split(' '));
export function renderControl(g, e, t, s, opts, p) {
  const { v, elapsed, index, position, px, py } = sampleState(s, t, opts.strength, opts.preview);
  const z = clamp(v), radius = e.family === 'precision' ? 5 : e.family === 'tactile' ? 16 : 24;
  const panel = (x, y, w, h, r = radius, color = p.panel) => rect(g, x, y, w, h, r, color);
  const txt = (str, x, y, size = 20, color = p.ink, align = 'left') => text(g, str, x, y, size, color, align);
  const button = (str, x, y, w, chosen = false) => { panel(x, y, w, 48, radius / 2, chosen ? p.accent : p.panel); txt(str, x + w / 2, y + 24, 17, chosen ? p.bg : p.ink, 'center'); };
  const row = (str, i, chosen = false) => { panel(104, 97 + i * 73, 432, 58, radius / 2, chosen ? p.accent : p.panel); txt(str, 127, 126 + i * 73, 18, chosen ? p.bg : p.ink); };
  const fade = fn => { g.save(); g.globalAlpha = z; fn(); g.restore(); };
  label(g, p, e.title.toUpperCase(), s.manual ? 'INTERACTIVE' : 'PREVIEW');
  switch (e.kind) {
    case 'switch':
      ['Notifications','Auto save','Private mode'].forEach((str, i) => {
        const on = s.manual ? mix(!!(s.fromBits&(1<<i)),!!(s.bits&(1<<i)),clamp(elapsed*5)) : i === 1 ? 1 - z : z; txt(str, 96, 119 + i * 82, 20);
        rect(g, 422, 97 + i * 82, 94, 46, radius, on > .5 ? p.accent : p.line);
        circle(g, 445 + 47 * on, 120 + i * 82, 17, p.panel);
      }); break;
    case 'check': case 'radio':
      ['Design','Build','Review'].forEach((str, i) => {
        const chosen = e.kind === 'check' ? !!(s.manual ? s.bits & (1 << i) : (1 << index) & (1 << i)) : index === i;
        txt(str, 161, 119 + 82 * i); const y = 119 + 82 * i;
        if (e.kind === 'radio') { g.lineWidth = 2; circle(g, 117, y, 18, p.panel, chosen ? p.accent : p.line); if (chosen) circle(g, 117, y, 9 + 2 * Math.sin(t * 3) * opts.strength, p.accent); }
        else { rect(g, 99, y - 18, 36, 36, e.family === 'precision' ? 3 : 8, chosen ? p.accent : p.panel, p.line); if (chosen) checkmark(g, 117, y, 21, p.bg, 1); }
      }); break;
    case 'button':
      ['Create','Save draft','Cancel'].forEach((str, i) => { const y = 170 + (index === i && s.pressed ? 5 : 0); button(str, 63 + i * 180, y, 155, i === 0); if (index === i && elapsed < 1.2) { g.save(); g.globalAlpha = (1 - elapsed / 1.2) * .3; circle(g, 140 + i * 180, 194, elapsed * 65, p.ink); g.restore(); } }); break;
    case 'fab':
      for (let i = 0; i < 3; i++) { const a = -Math.PI + (i + 1) * .6; circle(g, 430 + Math.cos(a) * 120 * z, 270 + Math.sin(a) * 120 * z, 25 * z, p.panel); if (z > .5) txt(['A','B','C'][i], 430 + Math.cos(a) * 120 * z, 270 + Math.sin(a) * 120 * z, 18, p.ink, 'center'); }
      transform(g, 430, 270, z * Math.PI / 4, 1, 1, () => { rect(g, -36, -36, 72, 72, radius, p.accent); line(g, [[-13,0],[13,0]], p.bg, 3); line(g, [[0,-13],[0,13]], p.bg, 3); }); txt(z > .5 ? 'Choose an action' : 'Create something', 115, 147); break;
    case 'list':
      ['Overview','Projects','Archive'].forEach((str, i) => row(str, i, index === i)); break;
    case 'menu':
      panel(179,77,282,258);['New file','Duplicate','Export'].forEach((str,i)=>{panel(193,95+i*73,254,58,8,index===i?p.accent:p.panel);txt(str,215,124+i*73,19,index===i?p.bg:p.ink);});break;
    case 'navview':
      panel(49,78,542,251);['Overview','Projects','Archive'].forEach((str,i)=>{panel(60,96+i*73,167,58,6,index===i?p.line:p.panel);txt(str,79,125+i*73,17);});rect(g,59,110+position*73,4,31,2,p.accent);rect(g,248,96,323,214,8,p.bg);txt(['Overview','Projects','Archive'][index],274,132,25);for(let i=0;i<3;i++)rect(g,275,172+i*35,242-i*40,10,5,p.line);break;
    case 'chip':
      ['Motion','Color','Type'].forEach((str, i) => { const on = s.manual ? s.bits & (1 << i) : index === i; button((on ? '✓ ' : '') + str, 71 + 170 * i, 174, 155, !!on); }); break;
    case 'slider':
      rect(g, 102, 189, 436, 10, 5, p.line); rect(g, 102, 189, 436 * z, 10, 5, p.accent); circle(g, 102 + 436 * z, 194, s.pressed ? 24 : 18, p.accent); circle(g, 102 + 436 * z, 194, 7, p.panel); txt(Math.round(z * 100) + '%', 320, 258, 32, p.ink, 'center'); break;
    case 'linear': {
      const progress = opts.preview || !s.manual ? phase(t, 5) : z;
      txt('Processing files', 100, 144); rect(g, 100, 186, 440, 12, 6, p.line); rect(g, 100, 186, 440 * progress, 12, 6, p.accent); txt(Math.round(progress * 100) + ' / 100', 540, 240, 18, p.muted, 'right'); break;
    }
    case 'spinner': case 'ticks':
      if (e.kind === 'spinner') { g.lineWidth = 9; circle(g, 320, 190, 58, null, p.line); g.beginPath(); const a = t * 2, span = .5 + (1 + Math.sin(t * 1.7)) * 2.1; g.arc(320, 190, 58, a, a + span); g.strokeStyle = p.accent; g.stroke(); }
      else for (let i = 0; i < 12; i++) transform(g, 320, 190, TAU * i / 12, 1, 1, () => { g.globalAlpha = .15 + .85 * phase(i / 12 - t); rect(g, -4, -57, 8, 20, 4, p.accent); });
      txt('Working', 320, 288, 20, p.muted, 'center'); break;
    case 'icon':
      transform(g, 320, 186, 0, 1 + .1 * Math.sin(elapsed * 12) * Math.exp(-elapsed * 4), 1, () => { circle(g, 0, 0, 64, p.panel); g.fillStyle = z > .5 ? p.accent : p.line; g.beginPath(); g.moveTo(0, 25); g.bezierCurveTo(-70,-12,-22,-56,0,-24); g.bezierCurveTo(22,-56,70,-12,0,25); g.fill(); }); txt(z > .5 ? 'Saved' : 'Save for later', 320, 282, 20, p.ink, 'center'); break;
    case 'input': case 'search': case 'palette':
      panel(87, 137, 466, 66, radius / 2); g.lineWidth = s.hover || s.text ? 3 : 1; rect(g, 87, 137, 466, 66, radius / 2, null, s.hover || s.text ? p.accent : p.line);
      txt(s.text || (e.kind === 'input' ? '' : 'Search commands…'), 112, 171, 20, s.text ? p.ink : p.muted);
      if (e.kind !== 'input') { const items = ['Create project','Open library','Change theme'].filter(str => !s.text || str.toLowerCase().includes(s.text.toLowerCase())); items.forEach((str,i) => { panel(87, 213 + i * 40, 466, 36, 5); txt(str, 113, 231 + i * 40, 16); }); if (!items.length) txt('No matches', 112, 234, 16, p.muted); }
      else { const lift=s.text?1:z;txt('Project name',mix(112,90,lift),mix(171,114,lift),mix(20,15,lift),p.muted); txt(`${s.text.length} characters`, 550, 229, 14, p.muted, 'right'); } if(s.outcome)txt(s.outcome.slice(0,46),112,349,15,p.accent);break;
    case 'appbar':
      panel(54, 82, 532, 234); rect(g, 54, 82, 532, 62, radius, p.accent); txt('Workspace', 87, 113, 23, p.bg); txt('☰', 548, 113, 25, p.bg, 'center'); for (let i=0;i<3;i++) rect(g, 86, 180+i*38, 390-i*60, 10, 5, p.line); if (elapsed < 1) { g.save(); g.globalAlpha = .3 * (1-elapsed); circle(g, 540, 113, elapsed*60, p.bg); g.restore(); } break;
    case 'nav': case 'tabs': case 'segment': case 'pagedots':
      if (e.kind === 'pagedots') { for (let i=0;i<3;i++) rect(g, 259 + i*42, 190, index===i?29:12, 12, 6, index===i?p.accent:p.line); txt(`Page ${index+1}`, 320, 132, 26, p.ink, 'center'); }
      else { panel(70, 151, 500, 82); if (e.kind !== 'tabs') rect(g, 80 + position*162, 161, 154, 62, radius/2, p.accent); ['Explore','Library','Profile'].forEach((str,i) => txt(str, 157 + i*162, 192, 18, e.kind!=='tabs'&&index===i?p.bg:p.ink, 'center')); if(e.kind==='tabs') rect(g, 87+position*162, 223, 140, 4, 2, p.accent); } break;
    case 'toast': case 'infobar':
      panel(70, 84, 500, 210); txt('Your workspace', 100, 123, 26); for(let i=0;i<3;i++) rect(g, 100, 167+i*30, 250+i*35, 8, 4, p.line);
      { const visible = s.manual ? elapsed < 3 ? out(elapsed*5) : 1-out((elapsed-3)*4) : .5+.5*Math.sin(t); transform(g,0,35*(1-visible),0,1,1,()=>{g.globalAlpha=clamp(visible);rect(g, 90, 279, 460, 55, radius/2, e.kind==='infobar'&&index===1?p.secondary:p.accent);txt(e.kind==='toast'?'Changes saved': ['Everything is up to date','Review the new settings','Connection restored'][index],112,306,18,p.bg);}); } break;
    case 'dialog': case 'alert': case 'teaching': case 'actions': case 'sheet': case 'pagesheet': case 'drawer': case 'context': case 'combo':
      transform(g,320,200,0,e.kind==='pagesheet'?1-z*.07:1,e.kind==='pagesheet'?1-z*.07:1,()=>{g.translate(-320,-200);panel(54,70,532,262);txt(s.outcome ? 'Result: '+s.outcome : 'Click to open',90,110,23);for(let i=0;i<3;i++)rect(g,90,153+i*46,310-i*45,12,6,p.line);});
      fade(() => {
        rect(g,54,70,532,262,radius,'#00000044');
        let x=155,y=120,w=330,h=175;
        if(['sheet','pagesheet','actions'].includes(e.kind)) {x=77;y=mix(345,120,z);w=486;h=210;}
        if(e.kind==='drawer'){x=mix(-250,54,z);y=70;w=260;h=262;}
        if(e.kind==='context'){x=clamp(px*640,65,320);y=clamp(py*400,85,150);w=260;}
        if(e.kind==='combo'){x=136;y=140;w=368;h=169;}
        panel(x,y,w,h); if(e.kind==='teaching'){g.beginPath();g.moveTo(x+40,y);g.lineTo(x+53,y-17);g.lineTo(x+66,y);g.fillStyle=p.panel;g.fill();}txt(e.kind==='teaching'?'Try this control':'Choose an option',x+24,y+35,21);
        if(['actions','drawer','combo','context'].includes(e.kind)) ['Option A','Option B','Option C'].forEach((str,i)=>{rect(g,x+16,y+60+i*37,w-32,30,5,index===i?p.accent:p.bg);txt(str,x+30,y+75+i*37,16,index===i?p.bg:p.ink);});
        else {txt('Keep your changes?',x+24,y+76,17,p.muted);button('Cancel',x+18,y+h-64,(w-48)/2);button('Confirm',x+w/2+6,y+h-64,(w-48)/2,true);}
        if(['sheet','pagesheet'].includes(e.kind)) rect(g,300,y+8,40,5,3,p.line);
      }); break;
    case 'tooltip':
      button('Hover here',222,189,196,true); { const a = opts.preview ? .5+.5*Math.sin(t*2) : s.hover?1:0; g.save();g.globalAlpha=a;panel(207,116,226,49,10);txt('A little extra context',320,140,17,p.ink,'center');g.restore(); } break;
    case 'card':
      {const lift=(s.hover||opts.preview?(.5+.5*Math.sin(t))*opts.strength:0)*14;g.save();g.shadowBlur=12+lift;g.shadowColor='#00000033';g.shadowOffsetY=8+lift;panel(188,90-lift,264,222);g.restore();rect(g,210,111-lift,220,104,12,p.accent);txt('A place for ideas',213,252-lift,22);txt('Open collection',213,282-lift,15,p.muted);} break;
    case 'badge': case 'parent':
      { const n=e.kind==='parent'?s.bits.toString(2).replace(/0/g,'').length:s.manual?s.count:Math.floor(t)%10;panel(139,121,362,144);txt(e.kind==='parent'?'Selected items':'Notifications',165,180,24);circle(g,485,129,24+Math.sin(elapsed*10)*Math.exp(-elapsed*4)*5,p.accent);txt(n,485,130,19,p.bg,'center');if(e.kind==='parent') for(let i=0;i<3;i++) {circle(g,221+i*99,238,12,s.bits&(1<<i)?p.accent:p.line);}} break;
    case 'loading':
      { const at=s.manual?elapsed:phase(t,5)*5;const loading=at<2.2,done=at>=2.2&&at<3.6;const w=loading?170:done?170:270;rect(g,320-w/2,162,w,64,24,done?p.secondary:p.accent);txt(loading?'Processing…':done?'✓ Completed':'Run process',320,194,21,p.bg,'center');if(loading){g.beginPath();g.arc(320,265,17,t*5,t*5+4.7);g.strokeStyle=p.accent;g.lineWidth=4;g.stroke();}} break;
    case 'send':
      {const u=s.manual?clamp(elapsed/1.2):phase(t,3);panel(72,246,115,56);panel(453,246,115,56);txt('Send',129,274,18,p.ink,'center');txt('Inbox',510,274,18, p.ink,'center');g.setLineDash([4,7]);g.beginPath();g.moveTo(130,246);g.quadraticCurveTo(320,20,510,246);g.strokeStyle=p.line;g.stroke();g.setLineDash([]);circle(g,mix(130,510,u),246-226*2*u*(1-u),15,p.accent);} break;
    case 'flip':
      for(let i=0;i<6;i++){const x0=121+(i%3)*146,y0=118+Math.floor(i/3)*92,j=5-i;const x=mix(x0,121+(j%3)*146,z),y=mix(y0,118+Math.floor(j/3)*92,z);panel(x,y,110,65,15,i===0?p.accent:p.panel);txt(String.fromCharCode(65+i),x+55,y+33,25,i===0?p.bg:p.ink,'center');} break;
    case 'toolbar': case 'commandbar':
      panel(67,138,506,111);['Draw','Move','Erase'].forEach((str,i)=>button(str,86+i*164,169,145,index===i));txt('Active tool: '+['Draw','Move','Erase'][index],320,293,18,p.muted,'center');break;
    case 'split':
      button('Publish',158,174,242,true);button('⌄',409,174,74,true);if(z>.5){panel(324,232,160,84,10);txt('Export',344,253,16);txt('Schedule',344,289,16);}txt(s.outcome||'Choose a path',320,113,20,p.muted,'center');break;
    case 'pages':
      {g.save();rect(g,125,93,390,222,22,p.panel);g.clip();for(let i=0;i<3;i++){const x=125+(i-position)*390;rect(g,x+16,109,358,190,18,[p.accent,p.secondary,p.line][i]);txt('0'+(i+1),x+195,204,70,p.bg,'center');}g.restore();txt('‹',92,203,42);txt('›',548,203,42);}break;
    case 'tree':
      panel(124,82,392,245);txt(z>.5?'⌄ Collection':'› Collection',151,119,23);for(let i=0;i<3;i++){g.save();g.globalAlpha=z;txt(['Sketches','Components','Experiments'][i],182,163+i*45*z,19,p.muted);line(g,[[158,136],[158,163+i*45*z],[169,163+i*45*z]],p.line,1);g.restore();}break;
    case 'stepper':
      panel(180,157,280,85);button('−',194,175,65);button('+',381,175,65);txt(s.manual?s.count:Math.floor(t)%12,320,199,34,p.ink,'center');break;
    case 'wheel':
      panel(177,80,286,249);rect(g,187,183,266,42,10,p.line);for(let i=-2;i<=2;i++){const y=204+i*43;g.save();g.globalAlpha=1-Math.abs(i)*.3;txt(String(2024+index+i),320,y,28-Math.abs(i)*3,p.ink,'center');g.restore();}break;
    case 'largetitle':
      panel(70,70,500,260);txt('Library',99,130-z*25,44-z*21);for(let i=0;i<4;i++) rect(g,99,190+i*32-z*24,386-i%2*100,11,5,p.line);rect(g,70,70,500,4,2,p.accent);break;
    default: throw new Error('Unknown control: '+e.kind);
  }
}
