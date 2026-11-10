import createModule, { type MeasurToolsSuite } from 'measur-tools-suite';
import { useEffect, useState } from 'react';

export const useMeasurToolsSuite = () => {
  const [toolsSuiteModule, setToolsSuiteModule] = useState<MeasurToolsSuite | null>(null);

  const initializeModule = async () => {
    try {
      const module = await createModule({
        locateFile: (path) => new URL(path, document.baseURI).href
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
