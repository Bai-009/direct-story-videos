import React from 'react';
import {Interactive} from 'remotion';
import {Stage,Text,span,useTime} from './shared';
type V=[number,number,number];
const verts:V[]=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
const faces=[{ids:[0,1,2,3],n:[0,0,-1] as V,c:'#accfbc'},{ids:[4,7,6,5],n:[0,0,1] as V,c:'#8baec5'},{ids:[0,4,5,1],n:[0,-1,0] as V,c:'#d6c9ad'},{ids:[3,2,6,7],n:[0,1,0] as V,c:'#6d9ea4'},{ids:[0,3,7,4],n:[-1,0,0] as V,c:'#8aafa1'},{ids:[1,5,6,2],n:[1,0,0] as V,c:'#d8c7a3'}];
const rotate=([x,y,z]:V,ay:number,ax:number):V=>{const xx=x*Math.cos(ay)+z*Math.sin(ay),zz=-x*Math.sin(ay)+z*Math.cos(ay);return [xx,y*Math.cos(ax)-zz*Math.sin(ax),y*Math.sin(ax)+zz*Math.cos(ax)];};
const shade=(hex:string,n:V)=>{const k=.58+.42*Math.max(0,n[0]*-.32+n[1]*-.5+n[2]*-.65);return '#'+[1,3,5].map(i=>Math.round(parseInt(hex.slice(i,i+2),16)*k).toString(16).padStart(2,'0')).join('');};
const MeshContent=()=>{
 const t=useTime(),turn=span(t,1.3,4.3),open=span(t,5.3,7.7)*(1-span(t,10.2,12.7));
 const ay=.02+turn*.72+span(t,7.8,14)*.58,ax=-.08-turn*.32;
 const polygons=faces.map((face,i)=>{
  const points=face.ids.map(k=>rotate(verts[k].map((v,j)=>v+face.n[j]*open*1.22) as V,ay,ax));
  const normal=rotate(face.n,ay,ax);
  const lens=1040-open*180;
  const screen=points.map(([x,y,z])=>[960+x*lens/(z+6),530+y*lens/(z+6)]);
  return {i,screen,depth:points.reduce((a,p)=>a+p[2],0)/4,color:shade(face.c,normal)};
 }).sort((a,b)=>b.depth-a.depth);
 return <Stage background="#111d24" label="Native 3D geometry: the camera reveals depth, six cube faces separate along their normals, then reassemble">
  <defs><radialGradient id="mesh-pool"><stop stopColor="#304449"/><stop offset="1" stopColor="#111d24"/></radialGradient><radialGradient id="mesh-shadow"><stop stopColor="#050a0e" stopOpacity=".75"/><stop offset="1" stopColor="#050a0e" stopOpacity="0"/></radialGradient></defs>
  <ellipse cx={960} cy={766} rx={650} ry={365} fill="url(#mesh-pool)"/>
  <ellipse cx={960} cy={833} rx={360+open*110} ry={57} fill="url(#mesh-shadow)"/>
  <g>{polygons.map(face=><polygon key={face.i} points={face.screen.map(p=>p.join(',')).join(' ')} fill={face.color} stroke="#d7e1d4" strokeWidth={1.25} strokeOpacity={.35}/>)}</g>
  <Text y={181} size={63} fill="#e8e6db" family="StudySerif" opacity={span(t,.4,1.1)*(1-span(t,4.4,5.1))}>A square is one view.</Text>
  <Text y={944} size={43} fill="#c5d3c9" opacity={span(t,7.4,8.2)}>Six faces. One volume.</Text>
 </Stage>;
};
export const Mesh=Interactive.create({Component:MeshContent,componentName:'<Mesh>',layout:'absolute-fill'});
