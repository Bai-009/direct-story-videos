import {Config} from '@remotion/cli/config';
import {existsSync} from 'node:fs';
Config.setRspack(true);
if(existsSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')) Config.setBrowserExecutable('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
Config.setChromiumOpenGlRenderer('swangle');
Config.setDisableSharedMemoryCapture(true);
