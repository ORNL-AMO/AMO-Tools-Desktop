/**
 * Contract for opening host app (MEASUR) calculators from inside the diagram.
 * The diagram requests a calculator by id, the host opens its own calculator modal, and resolves
 * with the value to apply to the input - or undefined when the user cancels.
 *
 * To add a calculator: add its id and label here, then register its modal in the host's DiagramCalculatorHostComponent.
 */
export type DiagramCalculatorId = 'heater-efficiency' | 'load-factor' | 'operating-hours';

export interface DiagramCalculatorRequest {
    calculatorId: DiagramCalculatorId,
    // * diagram units - host calculators open in these units so their inputs match the diagram
    unitsOfMeasure: string,
}

export type DiagramCalculatorResult = number | undefined;

export type OpenDiagramCalculatorFn = (request: DiagramCalculatorRequest) => Promise<DiagramCalculatorResult>;

export const diagramCalculatorLabels: Record<DiagramCalculatorId, string> = {
    'heater-efficiency': 'Calculate Heater Efficiency',
    'load-factor': 'Calculate Load Factor',
    'operating-hours': 'Calculate Operating Hours'
};
