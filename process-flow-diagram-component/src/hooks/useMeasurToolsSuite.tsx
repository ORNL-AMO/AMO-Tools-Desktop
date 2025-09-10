import measurToolsFactory from 'measur-tools-suite/bin/client.js';
import { useEffect, useState } from 'react';

export const useMeasurToolsSuite = () => {
  const [toolsSuiteModule, setToolsSuiteModule] = useState(null);

  const initializeModule = async () => {
    try {
      const module = await measurToolsFactory.default({
        locateFile: (path) => `/${path}`
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