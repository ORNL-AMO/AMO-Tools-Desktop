import { describe, it, expect } from 'vitest';
import { migrateInapplicableNodeTotals, FlowDiagramData } from 'process-flow-lib';
import { makeIntakeNode, makeSystemNode, makeDischargeNode } from '../__fixtures__/builders';

const makeDiagramData = (nodes: FlowDiagramData['nodes']): FlowDiagramData => ({ nodes, edges: [] } as unknown as FlowDiagramData);

describe('migrateInapplicableNodeTotals', () => {
  it('clears intake totalSourceFlow and discharge outlet totalDischargeFlow, leaving applicable sides and other nodes untouched', () => {
    const intake = makeIntakeNode('intake');
    const system = makeSystemNode('system');
    const discharge = makeDischargeNode('discharge');
    Object.assign(intake.data.userEnteredData as object, { totalSourceFlow: 0, totalDischargeFlow: 100 });
    Object.assign(system.data.userEnteredData as object, { totalSourceFlow: 100, totalDischargeFlow: 0 });
    Object.assign(discharge.data.userEnteredData as object, { totalSourceFlow: 100, totalDischargeFlow: 0 });
    const diagramData = makeDiagramData([intake, system, discharge]);

    migrateInapplicableNodeTotals(diagramData);

    expect((intake.data.userEnteredData as any).totalSourceFlow).toBeUndefined();
    expect((intake.data.userEnteredData as any).totalDischargeFlow).toBe(100);
    expect((discharge.data.userEnteredData as any).totalDischargeFlow).toBeUndefined();
    expect((discharge.data.userEnteredData as any).totalSourceFlow).toBe(100);
    expect((system.data.userEnteredData as any).totalSourceFlow).toBe(100);
    expect((system.data.userEnteredData as any).totalDischargeFlow).toBe(0);
  });

  it('is a no-op when the fields are absent', () => {
    const intake = makeIntakeNode('intake');
    delete (intake.data.userEnteredData as any).totalSourceFlow;
    const diagramData = makeDiagramData([intake]);

    migrateInapplicableNodeTotals(diagramData);

    expect('totalSourceFlow' in (intake.data.userEnteredData as object)).toBe(false);
  });
});
