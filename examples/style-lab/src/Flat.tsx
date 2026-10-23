import React from 'react';
import {Interactive} from 'remotion';
import {Stage,Text,clamp,lerp,span,useTime} from './shared';
const FlatContent=()=>{
 const t=useTime(),launch=clamp((t-2)/2.1),hit=4.1;
 const x=lerp(360,1010,launch);
 const land=span(t,hit,hit+.18),returnScale=t<hit?1:1-.24*Math.sin(clamp((t-hit)/.45)*Math.PI);
 const square=span(t,5.6,7.7),reveal=span(t,8.2,9.1);
 const anticipation=span(t,1.25,1.55)*(1-span(t,1.85,2));
 const sy=returnScale-anticipation*.22;
 const y=t<2?780-130*sy:t<hit?lerp(650,406,launch)-300*4*launch*(1-launch):536-130*sy;
 const angle=-Math.PI/2*(1-square);
 const squareY=780-140*(Math.abs(Math.cos(angle))+Math.abs(Math.sin(angle)));
 return <Stage background="#f4ead8" label="Flat graphic performance: a circle springs onto a triangle, then a square rolls along the baseline">
  <path d="M100 780H1820" stroke="#cfc4b0" strokeWidth={4}/>
  <g transform="translate(1010 780)">
   <path d="M-140 0 140 0 0-244Z" fill="#215e5b"/>
   <path d="M-140 0 0-244 0 0Z" fill="#327d72"/>
  </g>
  <g transform={`translate(${t<hit?x:1010} ${y}) scale(${1+anticipation*.16} ${sy})`}>
   <circle r={130} fill="#e7623f"/>
   <circle cx={-35} cy={-45} r={36} fill="#f58a58"/>
  </g>
  <g transform={`translate(${lerp(1630,1400,square)} ${squareY}) rotate(${angle*180/Math.PI})`}>
   <rect x={-140} y={-140} width={280} height={280} rx={6} fill="#e6b744"/>
   <path d="M-140-140H140V-94H-140Z" fill="#f3ca68"/>
  </g>
  <path d="M360 800h950" stroke="#215e5b" strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1-land} opacity={.45*(1-span(t,6,7))}/>
  <Text y={230} size={75} family="StudyHeavy" opacity={reveal}>A LITTLE MOMENTUM.</Text>
  <Text y={935} size={38} opacity={reveal}>Prepare. Release. Follow through.</Text>
 </Stage>;
};
export const Flat=Interactive.create({Component:FlatContent,componentName:'<Flat>',layout:'absolute-fill'});
