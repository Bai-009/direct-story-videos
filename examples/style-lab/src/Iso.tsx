import React from 'react';
import {Interactive} from 'remotion';
import {Stage,Text,lerp,span,useTime} from './shared';
type P=[number,number,number];
const project=([x,y,z]:P):[number,number]=>[960+(x-y)*78,730+(x+y)*37-z*95];
const poly=(points:P[])=>points.map(p=>project(p).join(',')).join(' ');
const Block=({x,y,z=0,w=1,d=1,h=1,colors=['#9ebec2','#547f91','#d5e6df'],stroke='none'}:{x:number;y:number;z?:number;w?:number;d?:number;h?:number;colors?:string[];stroke?:string})=>{
 const A:P=[x,y,z],B:P=[x+w,y,z],C:P=[x+w,y+d,z],D:P=[x,y+d,z],a:P=[x,y,z+h],b:P=[x+w,y,z+h],c:P=[x+w,y+d,z+h],dd:P=[x,y+d,z+h];
 return <g stroke={stroke} strokeWidth={2} strokeLinejoin="round"><polygon points={poly([D,C,c,dd])} fill={colors[0]}/><polygon points={poly([B,C,c,b])} fill={colors[1]}/><polygon points={poly([a,b,c,dd])} fill={colors[2]}/></g>;
};
const Parcel=({time,delay}:{time:number;delay:number})=>{
 const a=span(time,delay,delay+2.7),b=span(time,delay+3.6,delay+5.5);
 const x=time<delay+3.6?lerp(-5,-.3,a):lerp(-.3,delay>2?3.2:4.1,b),y=time<delay+3.6?1.15:lerp(1.15,-.6,b);
 const open=span(time,delay+.1,delay+.55);
 return <g opacity={open}><Block x={x} y={y} z={.25} w={.65} d={.65} h={.62} colors={['#da8f49','#b86b33','#ffd495']}/></g>;
};
const IsoContent=()=>{
 const t=useTime(),scan=(span(t,4.15,4.45)-span(t,5.25,5.55))+(span(t,8.3,8.6)-span(t,9.4,9.7));
 const lid=span(t,3.9,4.2)*(1-span(t,5.1,5.4))*.5+span(t,8,8.3)*(1-span(t,9.2,9.5))*.5;
 return <Stage background="#f0f3f4" label="Isometric motion: parcels enter, pass a scanning station, then leave on a second conveyor">
  <Text y={174} size={68} family="StudyHeavy" fill="#344862" opacity={span(t,.3,1.1)}>Every handoff has a path.</Text>
  <g transform={`translate(0 ${lerp(110,0,span(t,0,1.5))})`} opacity={span(t,0,1)}>
   <Block x={-6.2} y={-2.8} w={12} d={6} h={.16} z={-.7} colors={['#c4d3df','#a6bbcc','#e0e7eb']}/>
   <Block x={-5.4} y={.75} w={5.8} d={1.5} h={.2} colors={['#b7cad1','#91aab6','#d4e2e4']}/>
   <Block x={-.2} y={-1.2} w={5.4} d={1.5} h={.2} colors={['#b7cad1','#91aab6','#d4e2e4']}/>
   {Array.from({length:10},(_,i)=>{const a=project([-5.2+i*.53,.8,.22]),b=project([-5.2+i*.53,2.2,.22]);return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#92acb8" strokeWidth={3}/>;})}
   <Parcel time={t} delay={5.6}/><Parcel time={t} delay={1.4}/>
   <Block x={-.6} y={.65} z={.25} w={1.2} d={1.8} h={.12} colors={['#326a79','#2b5268','#497e88']}/>
   <Block x={-.65} y={2.05} z={.4} w={.18} d={.23} h={1.7} colors={['#698f9b','#4a7188','#c6e0e0']}/>
   <Block x={-.65} y={.45} z={.4} w={.18} d={.23} h={1.7} colors={['#698f9b','#4a7188','#c6e0e0']}/>
   <Block x={-.75} y={.35} z={2.1+lid} w={1.35} d={2.05} h={.28} colors={['#756b9c','#62597f','#b2a6c9']}/>
   {scan>.01?<polygon points={poly([[-.4,.6,1.8],[-.4,2.2,1.8],[-.4,2.2,.38],[-.4,.6,.38]])} fill="#5ab9bd" opacity={scan*.45}/>:null}
  </g>
  <Text x={440} y={943} size={37} fill="#597187" opacity={span(t,1,1.8)}>IN</Text>
  <Text x={960} y={943} size={37} fill="#597187" opacity={span(t,3.5,4.3)}>CHECK</Text>
  <Text x={1490} y={943} size={37} fill="#597187" opacity={span(t,6.5,7.3)}>OUT</Text>
 </Stage>;
};
export const Iso=Interactive.create({Component:IsoContent,componentName:'<Iso>',layout:'absolute-fill'});
