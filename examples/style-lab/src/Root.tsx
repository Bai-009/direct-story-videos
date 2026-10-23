import React from 'react';
import {Composition,Folder,Track,useVideoConfig} from 'remotion';
import {Ink} from './Ink';
import {Type} from './Type';
import {Flat} from './Flat';
import {Paper} from './Paper';
import {Iso} from './Iso';
import {Pixel} from './Pixel';
import {Mesh} from './Mesh';
import {Field} from './Field';
const Reel=()=>{const {fps}=useVideoConfig();return <Track name="Independent motion studies">
 <Ink name="01 — Hand-drawn mechanism" durationInFrames={14*fps}/>
 <Type name="02 — Kinetic typography" from={14*fps} durationInFrames={13*fps}/>
 <Flat name="03 — Flat graphic performance" from={27*fps} durationInFrames={12*fps}/>
 <Paper name="04 — Paper space" from={39*fps} durationInFrames={16*fps}/>
 <Iso name="05 — Isometric workflow" from={55*fps} durationInFrames={14*fps}/>
 <Pixel name="06 — Pixel action" from={69*fps} durationInFrames={12*fps}/>
 <Mesh name="07 — Native 3D geometry" from={81*fps} durationInFrames={16*fps}/>
 <Field name="08 — Generative field" from={97*fps} durationInFrames={16*fps}/>
</Track>;};
export const Root=()=> <>
 <Composition id="Style-Lab" component={Reel} durationInFrames={3390} fps={30} width={1920} height={1080}/>
 <Folder name="Motion-Studies">
  <Composition id="01-Ink-Mechanism" component={Ink} durationInFrames={420} fps={30} width={1920} height={1080}/>
  <Composition id="02-Kinetic-Type" component={Type} durationInFrames={390} fps={30} width={1920} height={1080}/>
  <Composition id="03-Flat-Performance" component={Flat} durationInFrames={360} fps={30} width={1920} height={1080}/>
  <Composition id="04-Paper-Space" component={Paper} durationInFrames={480} fps={30} width={1920} height={1080}/>
  <Composition id="05-Isometric-Flow" component={Iso} durationInFrames={420} fps={30} width={1920} height={1080}/>
  <Composition id="06-Pixel-Action" component={Pixel} durationInFrames={360} fps={30} width={1920} height={1080}/>
  <Composition id="07-Native-3D" component={Mesh} durationInFrames={480} fps={30} width={1920} height={1080}/>
  <Composition id="08-Generative-Field" component={Field} durationInFrames={480} fps={30} width={1920} height={1080}/>
 </Folder>
</>;
