import {bundle} from '@remotion/bundler';
import {getCompositions,renderStill,openBrowser} from '@remotion/renderer';
import fs from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const output=path.resolve('out/review');
await fs.mkdir(output,{recursive:true});
const serveUrl=await bundle({entryPoint:path.resolve('src/index.ts'),enableCaching:false});
const macChrome='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser=await openBrowser('chrome',{browserExecutable:process.env.CHROME_PATH||(existsSync(macChrome)?macChrome:undefined),chromeMode:'chrome-for-testing',chromiumOptions:{gl:'swangle'}});
const records=[],errors=[];
try {
 const comps=(await getCompositions(serveUrl,{puppeteerInstance:browser})).filter(c=>c.id!=='Style-Lab');
 if(comps.length!==8)throw Error('Expected eight registered motion studies.');
 for(const composition of comps){
  for(const frame of [...new Set([0,45,90,120,180,240,300,Math.min(390,composition.durationInFrames-15),composition.durationInFrames-1])]){
   const filename=`${composition.id}-${frame}.png`;
   await renderStill({serveUrl,composition,frame,puppeteerInstance:browser,imageFormat:'png',disableSharedMemoryCapture:true,output:path.join(output,filename),onBrowserLog:log=>{if(log.type==='error')errors.push({id:composition.id,frame,text:log.text});}});
   records.push({id:composition.id,frame,file:filename,width:composition.width,height:composition.height});
  }
  console.log('Reviewed source samples:',composition.id);
 }
 const inputs={};
 for(const file of ['package.json','package-lock.json','remotion.config.ts',...(await fs.readdir('public/fonts')).map(n=>'public/fonts/'+n)])inputs[file]=createHash('sha256').update(await fs.readFile(file)).digest('hex');
 for(const file of await fs.readdir('src'))if(/\.(tsx?|json)$/.test(file))inputs['src/'+file]=createHash('sha256').update(await fs.readFile(path.join('src',file))).digest('hex');
 await fs.writeFile(path.join(output,'manifest.json'),JSON.stringify({kind:'Actual composition source frames; not generated images or proof of full playback',inputs,records,errors},null,2)+'\n');
 if(errors.length)throw Error(`${errors.length} browser errors; inspect the manifest.`);
 console.log(`Complete: ${records.length} native 1920 × 1080 source frames; no browser errors.`);
} finally {await browser.close({silent:true});}
