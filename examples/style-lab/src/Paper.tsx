import React from 'react';
import {Interactive} from 'remotion';
import {Stage,Text,lerp,span,useTime} from './shared';
const PaperContent=()=>{
 const t=useTime(),travel=span(t,1,14),pass=span(t,5,8.5),dusk=span(t,8.3,11);
 const boatX=lerp(590,1130,travel),boatY=740+Math.sin(t*1.6)*6;
 return <Stage background="#f2cbb0" label="Paper miniature: a folded boat passes behind a foreground ridge into a second bay">
  <defs>
   <filter id="paper-grain"><feTurbulence type="fractalNoise" baseFrequency=".38" numOctaves="2" seed="12"/><feColorMatrix type="saturate" values="0"/></filter>
   <filter id="paper-shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="3" dy="13" stdDeviation="8" floodColor="#3e3d46" floodOpacity=".2"/></filter>
   <linearGradient id="paper-sky" x2="0" y2="1"><stop stopColor="#d9b9c9"/><stop offset="1" stopColor="#f0d5bd"/></linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#paper-sky)" opacity={dusk}/>
  <circle cx={1440-55*travel} cy={300+18*travel} r={112} fill="#f7e5b2"/>
  <g filter="url(#paper-shadow)" transform={`translate(${-travel*70} 0)`}><path d="M-60 700 270 320 510 640 880 390 1230 615 1550 340 2030 710V1100H-60Z" fill="#bba7c4"/></g>
  <g filter="url(#paper-shadow)" transform={`translate(${-travel*150} 0)`}><path d="M-80 795 230 565 610 795 960 520 1280 790 1680 545 2150 810V1100H-80Z" fill="#718f9d"/></g>
  <path d="M0 747Q480 715 960 746T1920 752V1080H0Z" fill="#648b94"/>
  {Array.from({length:8},(_,i)=><path key={i} d={`M${130+i*243-travel*95} ${800+i%3*55}h${70+i%3*25}`} stroke="#b6ccbd" strokeWidth={3} opacity={.5}/>) }
  <g transform={`translate(${boatX} ${boatY}) rotate(${Math.sin(t*1.6)*1.4})`} filter="url(#paper-shadow)">
   <path d="M-160-15 170-15 98 63H-88Z" fill="#e8d9bd"/>
   <path d="M-160-15 14 15 98 63H-88Z" fill="#fff3d4"/>
   <path d="M-88-15 9-168 87-15Z" fill="#fff8e7"/>
   <path d="M9-168 87-15 10 15Z" fill="#d9c8a9"/>
   <path d="M-160-15 14 15 170-15" fill="none" stroke="#c0b198" strokeWidth={2}/>
  </g>
  <g transform={`translate(${lerp(2000,-1350,pass)} 0)`} filter="url(#paper-shadow)"><path d="M-180 1080V750Q20 470 240 590L560 305 880 730 1150 1080Z" fill="#345969"/><path d="M-180 1080V924L180 760 360 1080Z" fill="#254a5b"/></g>
  <path d="M0 982Q330 862 720 977T1520 968L1920 893V1080H0Z" fill="#254a5b" filter="url(#paper-shadow)"/>
  <rect width="1920" height="1080" filter="url(#paper-grain)" opacity=".045"/>
  <Text y={188} size={65} family="StudySerif" fill="#493c43" opacity={span(t,10,11.8)}>Beyond the next fold.</Text>
 </Stage>;
};
export const Paper=Interactive.create({Component:PaperContent,componentName:'<Paper>',layout:'absolute-fill'});
