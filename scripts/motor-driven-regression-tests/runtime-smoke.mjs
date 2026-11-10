import { build } from 'esbuild';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const output = resolve(root, 'tmp/motor-driven-regression-tests/runtime-smoke');
const installed = resolve(root, 'node_modules/measur-tools-suite/bin/client.wasm');
const processFlowInstalled = resolve(root, 'process-flow-diagram-component/node_modules/measur-tools-suite/bin/client.wasm');
const packaged = resolve(root, 'dist/browser/client.wasm');
const hash = value => createHash('sha256').update(value).digest('hex');
if (hash(await readFile(installed)) !== hash(await readFile(packaged))) {
  throw new Error('Build output does not contain the installed Suite WASM; rebuild the app first.');
}
if (hash(await readFile(installed)) !== hash(await readFile(processFlowInstalled))) {
  throw new Error('Angular and process-flow must load the same installed Suite beta WASM.');
}
await mkdir(output, { recursive: true });
await build({ entryPoints: [resolve(root, 'src/app/tools-suite-api/motor-driven-regression-tests/runtime-smoke.ts')],
  bundle: true, platform: 'browser', format: 'iife', outfile: resolve(output, 'bundle.js'), logLevel: 'warning' });
await copyFile(packaged, resolve(output, 'client.wasm'));
await writeFile(resolve(output, 'index.html'), '<!doctype html><meta charset="utf-8"><title>Desktop Suite beta runtime verification</title><pre id="result">Running published-beta calculation check…</pre><script src="bundle.js"></script>');
await build({ stdin: {resolveDir: resolve(root, 'process-flow-diagram-component'), loader: 'tsx', contents: `
import React, {useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import useMeasurToolsSuite from './src/hooks/useMeasurToolsSuite';
import {calculateLandscapingResults} from '../src/process-flow-lib/water/logic/results';
function Check() {
  const suite = useMeasurToolsSuite();
  useEffect(() => {
    if (!suite) return;
    const water = new suite.WaterAssessment();
    try {
      const result = calculateLandscapingResults({areaIrrigated:1,yearlyInchesIrrigated:12},water);
      if (!Number.isFinite(result.grossWaterUse) || result.grossWaterUse <= 0) throw new Error('Invalid water estimate');
      document.querySelector('#result').textContent=JSON.stringify({passed:true,protocol:location.protocol,...result});
    } catch (error) {document.querySelector('#result').textContent=JSON.stringify({passed:false,error:String(error)});}
    finally {water.delete();}
  }, [suite]);
  return null;
}
createRoot(document.querySelector('#app')).render(<Check/>);
`}, bundle: true, platform: 'browser', format: 'iife', outfile: resolve(output, 'flow-bundle.js'), logLevel: 'warning' });
await writeFile(resolve(output, 'flow.html'), '<!doctype html><meta charset="utf-8"><title>Process-flow Suite beta verification</title><pre id="result">Running…</pre><div id="app"></div><script src="flow-bundle.js"></script>');
console.log('Browser consumer prepared at ' + output + '; serve that directory and open index.html.');
