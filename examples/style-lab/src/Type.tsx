import React from 'react';
import {Interactive} from 'remotion';
import {Stage,Text,hash,lerp,span,useTime} from './shared';
const TypeContent=()=>{
 const t=useTime(),clear=span(t,3,5.7),focus=span(t,4.9,6.1),exit=span(t,8.4,9.05),resolve=span(t,9.15,10.05);
 return <Stage background="#efff58" label="Kinetic typography: visual noise leaves the frame and the words gain space">
  <defs><clipPath id="type-stage"><rect x={100} y={100} width={1720} height={880}/></clipPath></defs>
  <g clipPath="url(#type-stage)">
   {Array.from({length:46},(_,i)=>{
    const x=120+hash(i+1)*1680+Math.sin(t*.9+i)*8,y=160+hash(i+70)*730+Math.sin(t*.7+i*.7)*6;
    const d=span(t,3+hash(i+120)*.9,4.9+hash(i+120)*.9);
    const direction=x<960?-1:1;
    return <text key={i} x={x+direction*d*(600+hash(i+150)*900)} y={y} fontFamily="StudySans" fontSize={18+hash(i+10)*38} fill="#1b251d" opacity={(.2+hash(i+40)*.55)*(1-d)}>{['MORE','FAST','LOUD','AGAIN','NOW','LOOK'][i%6]}</text>;
   })}
   <g transform={`translate(${-exit*1900} ${lerp(180,0,focus)})`} opacity={focus*(1-exit)}>
    <Text y={656} size={300} family="StudyHeavy">FOCUS.</Text>
   </g>
   <g opacity={resolve} transform={`translate(0 ${lerp(75,0,resolve)})`}>
    <Text y={505} size={215} family="StudyHeavy">ONE THING.</Text>
    <Text y={716} size={174} family="StudySerif">At a time.</Text>
   </g>
   <path d={`M${lerp(650,370,clear)} 790H${lerp(1270,1550,clear)}`} stroke="#1b251d" strokeWidth={7} opacity={span(t,6.6,7.4)*(1-span(t,8.5,9))}/>
  </g>
 </Stage>;
};
export const Type=Interactive.create({Component:TypeContent,componentName:'<Type>',layout:'absolute-fill'});
