import measurToolsFactory from 'measur-tools-suite/bin/client.js';
import { useEffect, useState } from 'react';

export const useMeasurToolsSuite = () => {
  const [toolsSuiteModule, setToolsSuiteModule] = useState(null);

  const initializeModule = async () => {
    try {
      // locateFile is required in the webpack-bundled context so Emscripten
      // resolves client.wasm from the server root rather than relative to the bundle.
      // Cast bypasses the ts_def public API which intentionally omits Emscripten options.
      const module = await (measurToolsFactory as unknown as (opts: object) => Promise<unknown>)({
        locateFile: (path: string) => `/${path}`
      });
      
      setToolsSuiteModule(module);
    } catch (error) {
      console.error('Failed to initialize Tools Suite Module:', error);
    }
  };

  useEffect(() => {
    initializeModule();
  }, []);

  return toolsSuiteModule;
};

export default useMeasurToolsSuite;