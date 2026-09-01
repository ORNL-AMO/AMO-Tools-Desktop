import { describe, it, expect } from 'vitest';
import { Node } from '@xyflow/react';
import { getDefaultSettings, getDefaultUserDiagramOptions, ProcessFlowPart } from 'process-flow-lib';
import {
  diagramSlice,
  setEdgeFlowConfidence,
  setNodeFlowConfidence,
  setEdgeStrokeColor,
  sourceFlowValueChange,
  diagramInitialized,
  diagramOptionsChange,
  getDefaultDiagramData,
  edgesChangeFromPropagation,
} from '../components/Diagram/diagramReducer';
import { makeIntakeNode, makeSystemNode, makeDischargeNode, makeEdge } from '../__fixtures__/builders';

describe('setEdgeFlowConfidence', () => {
  it('sets confidence on the targeted edge only, without touching its style', () => {
    const edgeA = makeEdge('intake', 'system', 100);
    const edgeB = makeEdge('system', 'discharge', 80);
    const state = { ...getDefaultDiagramData(), edges: [edgeA, edgeB] };

    const result = diagramSlice.reducer(state, setEdgeFlowConfidence({ edgeId: edgeA.id, confidence: 'metered' }));

    expect(result.edges.find((e) => e.id === edgeA.id).data.confidence).toBe('metered');
    expect(result.edges.find((e) => e.id === edgeB.id).data.confidence).toBe('estimated');
    expect(result.edges.find((e) => e.id === edgeA.id).style).toEqual(edgeA.style);
  });
});

describe('setNodeFlowConfidence', () => {
  it('sets confidence on the targeted node/flowProperty only', () => {
    const intake = makeIntakeNode('intake');
    const system = makeSystemNode('system');
    const state = { ...getDefaultDiagramData(), nodes: [intake, system] };

    const result = diagramSlice.reducer(state, setNodeFlowConfidence({ nodeId: 'intake', flowProperty: 'totalSourceFlow', confidence: 'metered' }));

    const updatedIntake = result.nodes.find((n) => n.id === 'intake') as Node<ProcessFlowPart>;
    const updatedSystem = result.nodes.find((n) => n.id === 'system') as Node<ProcessFlowPart>;
    expect(updatedIntake.data.flowConfidence.totalSourceFlow).toBe('metered');
    expect(updatedIntake.data.flowConfidence.totalDischargeFlow).toBe('estimated');
    expect(updatedSystem.data.flowConfidence.totalSourceFlow).toBe('estimated');
  });
});

describe('setEdgeStrokeColor', () => {
  it('flags the edge as having a manual color override', () => {
    const edge = makeEdge('intake', 'system', 100);
    edge.style = { stroke: '#000000' };
    const state = { ...getDefaultDiagramData(), edges: [edge], selectedDataId: edge.id };

    const result = diagramSlice.reducer(state, setEdgeStrokeColor({ color: '#ff0000' }));

    const updatedEdge = result.edges.find((e) => e.id === edge.id);
    expect(updatedEdge.style.stroke).toBe('#ff0000');
    expect(updatedEdge.data.hasManualColorOverride).toBe(true);
  });
});

describe('confidence persists through recalculation', () => {
  it('sourceFlowValueChange does not reset an edge already marked metered', () => {
    const edge = makeEdge('intake', 'system', 100);
    edge.data.confidence = 'metered';
    const intake = makeIntakeNode('intake');
    const system = makeSystemNode('system');
    const state = { ...getDefaultDiagramData(), nodes: [intake, system], edges: [edge], selectedDataId: 'system' };

    const result = diagramSlice.reducer(state, sourceFlowValueChange({ sourceEdgeId: edge.id, flowValue: 42 }));

    const updatedEdge = result.edges.find((e) => e.id === edge.id);
    expect(updatedEdge.data.flowValue).toBe(42);
    expect(updatedEdge.data.confidence).toBe('metered');
  });
});

describe('edgesChangeFromPropagation resets confidence', () => {
  it('propagates the seed edge\'s metered confidence onto downstream edges and every connected node total, but leaves the seed edge itself untouched', () => {
    const source = makeIntakeNode('source') as Node<ProcessFlowPart>;
    const nodeA = makeSystemNode('a') as Node<ProcessFlowPart>;
    const nodeB = makeDischargeNode('b') as Node<ProcessFlowPart>;
    const nodeC = makeDischargeNode('c') as Node<ProcessFlowPart>;

    const seedEdge = makeEdge('source', 'a', 100);
    const edgeAB = makeEdge('a', 'b', 50);
    const edgeAC = makeEdge('a', 'c', 50);

    seedEdge.data.confidence = 'metered';
    edgeAB.data.confidence = 'estimated';
    edgeAC.data.confidence = 'estimated';
    source.data.flowConfidence.totalDischargeFlow = 'estimated';
    nodeA.data.flowConfidence.totalSourceFlow = 'estimated';
    nodeA.data.flowConfidence.totalDischargeFlow = 'estimated';
    nodeB.data.flowConfidence.totalSourceFlow = 'estimated';
    nodeC.data.flowConfidence.totalSourceFlow = 'estimated';

    const state = {
      ...getDefaultDiagramData(),
      nodes: [source, nodeA, nodeB, nodeC],
      edges: [seedEdge, edgeAB, edgeAC],
    };

    const result = diagramSlice.reducer(state, edgesChangeFromPropagation({
      flowUpdates: { [seedEdge.id]: 100, [edgeAB.id]: 50, [edgeAC.id]: 50 },
      startingNodeId: 'source',
      initialEdgeId: seedEdge.id,
    }));

    expect(result.edges.find((e) => e.id === seedEdge.id).data.confidence).toBe('metered');
    expect(result.edges.find((e) => e.id === edgeAB.id).data.confidence).toBe('metered');
    expect(result.edges.find((e) => e.id === edgeAC.id).data.confidence).toBe('metered');

    const updatedSource = result.nodes.find((n) => n.id === 'source') as Node<ProcessFlowPart>;
    const updatedA = result.nodes.find((n) => n.id === 'a') as Node<ProcessFlowPart>;
    const updatedB = result.nodes.find((n) => n.id === 'b') as Node<ProcessFlowPart>;
    const updatedC = result.nodes.find((n) => n.id === 'c') as Node<ProcessFlowPart>;
    // * source's outflow and a's inflow are fed by the seed edge itself - inherit its confidence even though the seed edge's own confidence is untouched
    expect(updatedSource.data.flowConfidence.totalDischargeFlow).toBe('metered');
    expect(updatedA.data.flowConfidence.totalSourceFlow).toBe('metered');
    expect(updatedA.data.flowConfidence.totalDischargeFlow).toBe('metered');
    expect(updatedB.data.flowConfidence.totalSourceFlow).toBe('metered');
    expect(updatedC.data.flowConfidence.totalSourceFlow).toBe('metered');
  });

  it('propagates the seed edge\'s estimated confidence onto downstream edges and connected node totals', () => {
    const source = makeIntakeNode('source') as Node<ProcessFlowPart>;
    const nodeA = makeSystemNode('a') as Node<ProcessFlowPart>;

    const seedEdge = makeEdge('source', 'a', 100);
    const edgeAB = makeEdge('a', 'b', 100);

    seedEdge.data.confidence = 'estimated';
    edgeAB.data.confidence = 'metered';
    nodeA.data.flowConfidence.totalDischargeFlow = 'metered';

    const state = {
      ...getDefaultDiagramData(),
      nodes: [source, nodeA],
      edges: [seedEdge, edgeAB],
    };

    const result = diagramSlice.reducer(state, edgesChangeFromPropagation({
      flowUpdates: { [seedEdge.id]: 100, [edgeAB.id]: 100 },
      startingNodeId: 'source',
      initialEdgeId: seedEdge.id,
    }));

    expect(result.edges.find((e) => e.id === seedEdge.id).data.confidence).toBe('estimated');
    expect(result.edges.find((e) => e.id === edgeAB.id).data.confidence).toBe('estimated');

    const updatedA = result.nodes.find((n) => n.id === 'a') as Node<ProcessFlowPart>;
    expect(updatedA.data.flowConfidence.totalDischargeFlow).toBe('estimated');
  });
});

describe('flow confidence migration', () => {
  it('stamps default estimated confidence onto edges and nodes missing the field (legacy saved diagrams)', () => {
    // simulates a diagram saved before this feature shipped - data shapes intentionally
    // omit `confidence`/`flowConfidence` and are cast past the type system for that reason.
    const legacyEdge = {
      id: 'xy-edge__intakee-systema',
      source: 'intake',
      target: 'system',
      sourceHandle: 'e',
      targetHandle: 'a',
      data: {
        flowValue: 10,
        hasOwnEdgeType: '',
        edgeDescription: 'intake-system',
      },
    } as any;

    const legacyNode = {
      id: 'intake',
      type: 'water-intake',
      position: { x: 0, y: 0 },
      data: {
        name: 'intake',
        processComponentType: 'water-intake',
        className: 'water-intake',
        cost: 0,
        isValid: true,
        createdByAssessment: false,
        diagramNodeId: 'intake',
        handles: {},
        userEnteredData: {},
      },
    } as any;

    const legacyDiagramData = {
      name: 'legacy diagram',
      nodes: [legacyNode],
      edges: [legacyEdge],
      diagramFlowErrors: {},
      userDiagramOptions: getDefaultUserDiagramOptions(),
      settings: getDefaultSettings(),
      calculatedData: { nodes: {} },
      recentNodeColors: [],
      recentEdgeColors: [],
    } as any;

    const state = getDefaultDiagramData();
    const result = diagramSlice.reducer(state, diagramInitialized({
      diagramData: legacyDiagramData,
      parentContainer: { height: 100, headerHeight: 0, footerHeight: 0 },
      assessmentId: undefined,
    }));

    expect(result.edges[0].data.confidence).toBe('estimated');
    expect(result.edges[0].data.hasManualColorOverride).toBe(false);
    expect((result.nodes[0].data as any).flowConfidence).toEqual({ totalSourceFlow: 'estimated', totalDischargeFlow: 'estimated' });
  });
});

describe('edge coloring options (colorEdgesByConfidence / estimatedFlowColor / meteredFlowColor)', () => {
  it('diagramInitialized stamps all 3 fields onto a diagram whose saved userDiagramOptions predates them, so later diagramOptionsChange dispatches actually apply', () => {
    // Regression test: diagramOptionsChangeReducer only sets a field `if (optionsProp in state.diagramOptions)`.
    // A legacy userDiagramOptions object (saved before this feature shipped) never had these keys at all,
    // so without stamping them in diagramInitializedReducer, every dispatch below would silently no-op.
    const legacyUserDiagramOptions = {
      strokeWidth: 2,
      edgeType: 'smoothstep',
      minimapVisible: false,
      controlsVisible: true,
      directionalArrowsVisible: true,
      showFlowLabels: true,
      flowLabelSize: 1,
      animated: false,
      // * intentionally no colorEdgesByConfidence/estimatedFlowColor/meteredFlowColor keys
    } as any;

    const legacyDiagramData = {
      name: 'legacy diagram',
      nodes: [],
      edges: [],
      diagramFlowErrors: {},
      userDiagramOptions: legacyUserDiagramOptions,
      settings: getDefaultSettings(),
      calculatedData: { nodes: {} },
      recentNodeColors: [],
      recentEdgeColors: [],
    } as any;

    let state = diagramSlice.reducer(getDefaultDiagramData(), diagramInitialized({
      diagramData: legacyDiagramData,
      parentContainer: { height: 100, headerHeight: 0, footerHeight: 0 },
      assessmentId: undefined,
    }));

    expect('colorEdgesByConfidence' in state.diagramOptions).toBe(true);
    expect('estimatedFlowColor' in state.diagramOptions).toBe(true);
    expect('meteredFlowColor' in state.diagramOptions).toBe(true);
    expect(state.diagramOptions.colorEdgesByConfidence).toBe(false);

    state = diagramSlice.reducer(state, diagramOptionsChange({ optionsProp: 'colorEdgesByConfidence', updatedValue: true }));
    state = diagramSlice.reducer(state, diagramOptionsChange({ optionsProp: 'estimatedFlowColor', updatedValue: '#ff9900' }));
    state = diagramSlice.reducer(state, diagramOptionsChange({ optionsProp: 'meteredFlowColor', updatedValue: '#00cc44' }));

    expect(state.diagramOptions.colorEdgesByConfidence).toBe(true);
    expect(state.diagramOptions.estimatedFlowColor).toBe('#ff9900');
    expect(state.diagramOptions.meteredFlowColor).toBe('#00cc44');
  });

  it('resets a custom color back to undefined (default theme color) via diagramOptionsChange', () => {
    let state = diagramSlice.reducer(getDefaultDiagramData(), diagramOptionsChange({ optionsProp: 'estimatedFlowColor', updatedValue: '#ff9900' }));
    state = diagramSlice.reducer(state, diagramOptionsChange({ optionsProp: 'meteredFlowColor', updatedValue: '#00cc44' }));

    state = diagramSlice.reducer(state, diagramOptionsChange({ optionsProp: 'estimatedFlowColor', updatedValue: undefined }));

    expect(state.diagramOptions.estimatedFlowColor).toBeUndefined();
    expect(state.diagramOptions.meteredFlowColor).toBe('#00cc44');
  });
});

describe('flowConfidenceEnabled (master feature toggle)', () => {
  it('diagramInitialized stamps the field as true onto a diagram whose saved userDiagramOptions predates it, so the feature stays on for existing diagrams', () => {
    const legacyUserDiagramOptions = {
      strokeWidth: 2,
      edgeType: 'smoothstep',
      minimapVisible: false,
      controlsVisible: true,
      directionalArrowsVisible: true,
      showFlowLabels: true,
      flowLabelSize: 1,
      animated: false,
      // * intentionally no flowConfidenceEnabled key
    } as any;

    const legacyDiagramData = {
      name: 'legacy diagram',
      nodes: [],
      edges: [],
      diagramFlowErrors: {},
      userDiagramOptions: legacyUserDiagramOptions,
      settings: getDefaultSettings(),
      calculatedData: { nodes: {} },
      recentNodeColors: [],
      recentEdgeColors: [],
    } as any;

    const state = diagramSlice.reducer(getDefaultDiagramData(), diagramInitialized({
      diagramData: legacyDiagramData,
      parentContainer: { height: 100, headerHeight: 0, footerHeight: 0 },
      assessmentId: undefined,
    }));

    expect('flowConfidenceEnabled' in state.diagramOptions).toBe(true);
    expect(state.diagramOptions.flowConfidenceEnabled).toBe(true);
  });

  it('toggles off and back on via diagramOptionsChange', () => {
    let state = diagramSlice.reducer(getDefaultDiagramData(), diagramOptionsChange({ optionsProp: 'flowConfidenceEnabled', updatedValue: false }));
    expect(state.diagramOptions.flowConfidenceEnabled).toBe(false);

    state = diagramSlice.reducer(state, diagramOptionsChange({ optionsProp: 'flowConfidenceEnabled', updatedValue: true }));
    expect(state.diagramOptions.flowConfidenceEnabled).toBe(true);
  });
});
