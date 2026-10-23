import {bundle} from '@remotion/bundler';
import {getCompositions, renderMedia, renderStill, openBrowser} from '@remotion/renderer';
import fs from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';

// Run from examples/style-lab. Preserve the complete timeline; sample every
// other source frame without changing animation time or speeding up playback.
const output = path.resolve('../../docs/motion/gifs');
const names = ['01-ink', '02-type', '03-flat', '04-paper', '05-iso', '06-pixel', '07-mesh', '08-field'];
await fs.mkdir(output, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), enableCaching: false});
const macChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser = await openBrowser('chrome', {
  browserExecutable: process.env.CHROME_PATH || (existsSync(macChrome) ? macChrome : undefined),
  chromeMode: 'chrome-for-testing', chromiumOptions: {gl: 'swangle'},
});
const records = [], errors = [], inputs = {};
const only = process.argv.find(arg => arg.startsWith('--only='))?.slice(7);
const filter = 'split[v],palettegen=max_colors=192,[v]paletteuse=dither=bayer:bayer_scale=3';
try {
  const comps = (await getCompositions(serveUrl, {puppeteerInstance: browser})).filter(c => c.id !== 'Style-Lab');
  if (comps.length !== 8) throw Error('Expected eight motion studies.');
  if (only && !comps.some(c => c.id === only)) throw Error(`Unknown composition: ${only}`);
  for (const [i, composition] of comps.entries()) {
    const file = `${names[i]}.gif`, target = path.join(output, file);
    if (only && composition.id !== only) {
      const prior = JSON.parse(await fs.readFile(path.join(output, 'manifest.json'), 'utf8'));
      records.push(prior.records.find(record => record.id === composition.id));
      continue;
    }
    console.log(`Rendering ${composition.id}: complete ${composition.durationInFrames / composition.fps}s`);
    if (composition.id === '04-Paper-Space') {
      // Reused browser pages can retain stale SVG-filter tiles in this scene.
      // Fresh-page still captures force a complete paint for every source frame.
      const frames = path.resolve('out/gif-paper-frames');
      await fs.mkdir(frames, {recursive: true});
      let next = 0, completed = 0;
      const worker = async () => {
        while (next < composition.durationInFrames / 2) {
          const index = next++;
          await renderStill({serveUrl, composition, puppeteerInstance: browser,
            frame: index * 2, scale: 0.5, imageFormat: 'png', disableSharedMemoryCapture: true,
            output: path.join(frames, `frame${String(index).padStart(4, '0')}.png`),
            onBrowserLog: log => {if (log.type === 'error') errors.push({id: composition.id, frame: index * 2, text: log.text});}});
          if (++completed % 40 === 0) console.log(`Paper: ${completed}/${composition.durationInFrames / 2} full-paint captures`);
        }
      };
      await Promise.all([worker(), worker()]);
      await new Promise((resolve, reject) => {
        const proc = spawn(process.env.FFMPEG_PATH || 'ffmpeg', ['-v', 'error', '-y', '-framerate', '15',
          '-i', path.join(frames, 'frame%04d.png'), '-filter_complex', filter, '-loop', '0', target], {stdio: 'inherit'});
        proc.on('error', reject);
        proc.on('exit', code => code === 0 ? resolve() : reject(Error(`ffmpeg exited ${code}`)));
      });
    } else await renderMedia({
      serveUrl, composition, puppeteerInstance: browser,
      codec: 'gif', outputLocation: target, imageFormat: 'png',
      scale: 0.5, everyNthFrame: 2, numberOfGifLoops: null,
      concurrency: 2, disableSharedMemoryCapture: true,
      // Ordered dithering keeps texture from turning into random GIF noise.
      ffmpegOverride: ({args}) => args.map(arg => arg === 'split[v],palettegen,[v]paletteuse'
        ? filter : arg),
      onBrowserLog: log => {if (log.type === 'error') errors.push({id: composition.id, text: log.text});},
    });
    const data = await fs.readFile(target);
    records.push({id: composition.id, file, width: 960, height: 540, sourceFps: composition.fps,
      everyNthFrame: 2, nominalFps: 15, sourceFrames: composition.durationInFrames,
      durationSeconds: composition.durationInFrames / composition.fps,
      capture: composition.id === '04-Paper-Space' ? 'fresh-page full-paint source frames, then ffmpeg' : 'Remotion renderMedia',
      loop: 'infinite; hard restart of the authored scene', bytes: data.length,
      sha256: createHash('sha256').update(data).digest('hex')});
    console.log(`Complete ${file}: ${(data.length / 1024 / 1024).toFixed(2)} MiB`);
  }
  for (const file of ['package.json', 'package-lock.json', 'remotion.config.ts', 'scripts/gifs.mjs',
    ...(await fs.readdir('src')).filter(n => /\.(tsx?|json)$/.test(n)).map(n => 'src/' + n),
    ...(await fs.readdir('public/fonts')).map(n => 'public/fonts/' + n)]) {
    inputs[file] = createHash('sha256').update(await fs.readFile(file)).digest('hex');
  }
  if (errors.length) throw Error(JSON.stringify(errors));
  await fs.writeFile(path.join(output, 'manifest.json'), JSON.stringify({
    kind: 'Complete source-rendered GIF previews, no generated still assets',
    sourceRoot: '../../../examples/style-lab',
    note: 'GIF frame delays are quantized to centiseconds; nominal 15 fps. Native PNG frames remain available at 1920x1080.',
    inputs, records, errors,
  }, null, 2) + '\n');
} finally {await browser.close({silent: true});}
