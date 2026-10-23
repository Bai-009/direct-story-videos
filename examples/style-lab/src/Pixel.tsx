import React from 'react';
import {Interactive} from 'remotion';
import {clamp,hash,useTime} from './shared';
const sprite=[
 '    GG      GG    ',
 '   GYYG    GYYG   ',
 '   GKWG    GKWG   ',
 '  GYYYYYYYYYYYYG  ',
 ' GYYYYYYYYYYYYYYG ',
 ' GYYYDYYYYYYDYYYG ',
 '  GYYYYDDDDYYYYG  ',
 '   GYYYYYYYYYYG   ',
 '  GGYYYYYYYYYYGG  ',
 ' GYYYGGGGGGGYYYYG ',
 ' GGGG       GGGGG ',
];
const palette:Record<string,string>={G:'#588768',Y:'#b8d078',K:'#1b2739',W:'#e1e9c1',D:'#81a06b'};
const PixelContent=()=>{
 const raw=useTime(),t=Math.floor(raw*12)/12;
 let x=80,y=155,crouch=1;
 const jumps=[{a:3,b:4.3,x0:80,x1:187,h:55},{a:8,b:9.6,x0:187,x1:302,h:68}];
 let settled=0,inAir=false;
 for(const [i,j] of jumps.entries()){if(t>=j.a&&t<=j.b){const p=clamp((t-j.a)/(j.b-j.a));x=Math.round(j.x0+(j.x1-j.x0)*p);y=Math.round(155-4*j.h*p*(1-p));inAir=true;}else if(t>j.b){x=j.x1;settled=i+1;}if(t>=j.a-.5&&t<j.a)crouch=.72;if(t>=j.b&&t<j.b+.25)crouch=.78;}
 if(!inAir)y=155+Math.round(Math.sin(t*1.5+settled));
 const blink=(Math.floor(t*2)%9===0&&t>1);
 return <svg width={1920} height={1080} viewBox="0 0 384 216" shapeRendering="crispEdges" role="img" aria-label="Pixel action: a frog anticipates, jumps in two ballistic arcs and settles on a lily pad">
  <rect width={384} height={216} fill="#192d46"/>
  <path d="M0 139 16 135 41 138 58 133 84 139 112 134 140 138 163 131 187 138 216 136 240 141 264 133 295 136 320 131 347 138 370 134 384 137V216H0Z" fill="#254b60"/>
  <path d="M0 172H384V216H0Z" fill="#1b3c50"/>
  <rect x={289} y={32} width={28} height={28} fill="#d7b284"/><rect x={282} y={39} width={42} height={14} fill="#d7b284"/>
  {Array.from({length:32},(_,i)=><rect key={i} x={Math.floor(hash(i+4)*370)} y={Math.floor(17+hash(i+60)*100)} width={i%4?1:2} height={1} fill="#91a6a6" opacity={.3+hash(i)*.5}/>) }
  {[80,187,302].map((cx,i)=><g key={i} transform={`translate(${cx} ${155+Math.round(Math.sin(t*1.5+i)*1)})`}><path d="M-25 0H20V3H28V7H16V10H-24V7H-29V3H-25Z" fill="#527f6d"/><path d="M-21 0H15V3H23V5H-20Z" fill="#7ca388"/><path d="M0 0 12 7H0Z" fill="#254b60"/></g>)}
  {Array.from({length:27},(_,i)=><rect key={i} x={Math.floor((hash(i+3)*384+t*(i%2?1:-1)*2+384)%384)} y={Math.floor(162+hash(i+30)*46)} width={6+Math.floor(hash(i+8)*17)} height={1} fill="#527889" opacity={.3}/>) }
  <g transform={`translate(${x-17} ${y-22*crouch}) scale(2 ${2*crouch})`}>
   {sprite.flatMap((row,r)=>Array.from(row,(code,c)=>code===' '?null:<rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill={blink&&r===2&&code==='K'?palette.G:palette[code]}/>))}
  </g>
  {[4.3,9.6].map((when,i)=>{const p=clamp((t-when)/.55);return t>when&&p<1?<g key={i} fill="#9ec4bb" opacity={1-p}>{[-1,1].map(dir=><rect key={dir} x={(i?302:187)+dir*(22+p*15)} y={152-12*Math.sin(p*Math.PI)} width={2} height={3}/>)}</g>:null;})}
 </svg>;
};
export const Pixel=Interactive.create({Component:PixelContent,componentName:'<Pixel>',layout:'absolute-fill'});
