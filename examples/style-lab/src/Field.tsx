import React from 'react';
import {Interactive} from 'remotion';
import {Stage,hash,lerp,span,useTime} from './shared';
const FieldContent=()=>{
 const t=useTime(),wave=span(t,1.8,6.8),ring=span(t,8.3,12.4),breathe=1+.035*Math.sin(t*1.15);
 return <Stage background="#080c12" label="Generative motion: independent particles phase into a wave, then form a breathing ring without a hard cut">
  <defs><radialGradient id="field-wash"><stop stopColor="#16303a"/><stop offset="1" stopColor="#080c12"/></radialGradient></defs>
  <ellipse cx={960} cy={540} rx={920} ry={540} fill="url(#field-wash)"/>
  {Array.from({length:720},(_,i)=>{
   const col=i%120,row=Math.floor(i/120),angle=i/720*Math.PI*2;
   const sx=130+hash(i+5)*1660+Math.sin(t*(.3+hash(i))+.9*i)*15;
   const sy=160+hash(i+18)*760+Math.cos(t*(.4+hash(i+1))+i)*19;
   const wx=170+col*13.25,wy=540+Math.sin(col*.075-t*1.3)*130+(row-2.5)*19;
   const radius=300+(row-2.5)*17;
   const rx=960+Math.cos(angle+t*.12)*radius*breathe*1.6,ry=540+Math.sin(angle+t*.12)*radius*breathe*.84;
   const x=lerp(lerp(sx,wx,wave),rx,ring),y=lerp(lerp(sy,wy,wave),ry,ring);
   return <circle key={i} cx={x} cy={y} r={1.8+hash(i+36)*2.5} fill={i%17===0?'#e8b675':i%5===0?'#79b8ba':'#d3dfdc'} opacity={.3+hash(i+40)*.6}/>;
  })}
 </Stage>;
};
export const Field=Interactive.create({Component:FieldContent,componentName:'<Field>',layout:'absolute-fill'});
