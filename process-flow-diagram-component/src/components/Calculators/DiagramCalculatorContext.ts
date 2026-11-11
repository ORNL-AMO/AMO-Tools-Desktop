import { createContext, useContext } from 'react';
import { OpenDiagramCalculatorFn } from 'process-flow-lib';

/**
 * Host app (MEASUR) calculator bridge, provided at the App root. Undefined when no host provides calculators.
 */
export const DiagramCalculatorContext = createContext<OpenDiagramCalculatorFn | undefined>(undefined);

export const useOpenDiagramCalculator = (): OpenDiagramCalculatorFn | undefined => useContext(DiagramCalculatorContext);
