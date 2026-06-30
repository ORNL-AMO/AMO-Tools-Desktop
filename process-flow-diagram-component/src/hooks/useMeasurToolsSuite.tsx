import { useEffect, useState } from 'react';

import createModule, { type MeasurToolsSuite } from 'measur-tools-suite';

export const useMeasurToolsSuite = () => {
  const [toolsSuiteModule, setToolsSuiteModule] = useState<MeasurToolsSuite | null>(null);

  const initializeModule = async () => {
    try {
      const module: MeasurToolsSuite = await createModule({
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