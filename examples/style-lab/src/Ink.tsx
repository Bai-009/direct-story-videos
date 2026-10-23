import React from 'react';
import {Interactive} from 'remotion';
import {Draw,Stage,Text,hash,span,useTime} from './shared';
const InkContent=()=>{
 const t=useTime();
 const shear=Math.sin(Math.max(0,t-1)*2.4)*85*span(t,.8,1.7)*(1-span(t,5,6.3));
 const h=Math.sqrt(370*370-shear*shear),top=770-h;
 const points=[[600,770],[600+shear,top],[1270+shear,top],[1270,770],[600,770]];
 const d=points.slice(1).reduce((str,p,i)=>{const a=points[i];return str+` Q${(a[0]+p[0])/2+(hash(i+2)-.5)*6} ${(a[1]+p[1])/2+(hash(i+20)-.5)*6} ${p[0]} ${p[1]}`;},'M600 770');
 const lock=span(t,6.3,7.8);
 const arrow=span(t,9,9.5)*(1-span(t,12,12.5));
 return <Stage background="#faf9f3" label="Hand-drawn mechanism: a four-bar shape shears, then a diagonal fixes its geometry">
  <defs><filter id="ink-paper"><feTurbulence type="fractalNoise" baseFrequency=".45" numOctaves="2" seed="9"/><feColorMatrix type="saturate" values="0"/></filter></defs>
  <rect width="1920" height="1080" opacity=".025" filter="url(#ink-paper)"/>
  <Text y={205} size={67} family="StudySerif" opacity={span(t,.3,1)}>What keeps a shape?</Text>
  {t>2&&t<5.8?<path d="M600 770 600 400 1270 400 1270 770" stroke="#aaa89c" fill="none" strokeWidth={3} strokeDasharray="5 14" opacity={.42}/>:null}
  <Draw d={d} p={span(t,.25,1.5)} width={6}/>
  <Draw d={d} p={span(t,.3,1.55)} width={1.5} opacity={.3}/>
  <Draw d="M600 770 1270 400" color="#ce623f" width={6} p={lock}/>
  {[[600,770],[600+shear,top],[1270+shear,top],[1270,770]].map(([x,y],i)=><g key={i} opacity={span(t,.6,1.6)}><circle cx={x} cy={y} r={11} fill="#faf9f3" stroke="#263538" strokeWidth={4}/><circle cx={x} cy={y} r={2.5} fill="#263538"/></g>)}
  <Draw d="M400 770h980" color="#c6c2b4" width={2} p={span(t,.8,1.3)}/>
  <g opacity={arrow} stroke="#77827a" fill="none" strokeWidth={4}><path d="M1380 415h100m-23-17 23 17-23 17"/></g>
  <Text y={916} size={43} opacity={span(t,2,2.7)*(1-span(t,5.6,6))}>The joints can move. The four sides keep their lengths.</Text>
  <Text y={916} size={43} fill="#a2472d" opacity={span(t,7.8,8.5)}>Fix one diagonal. The shape can no longer shear.</Text>
 </Stage>;
};
export const Ink=Interactive.create({Component:InkContent,componentName:'<Ink>',layout:'absolute-fill'});
