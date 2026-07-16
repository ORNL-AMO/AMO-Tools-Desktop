import { useEffect, useState } from 'react';

export const useMeasurToolsSuite = () => {
  const [toolsSuiteModule, setToolsSuiteModule] = useState(null);

  const initializeModule = async () => {
    try {
      const measurToolsFactory = await import('measur-tools-suite/bin/client.js');
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
