import { describe, it, expect } from 'vitest';
import { WaterDiagram } from 'process-flow-lib';
import { configureAppStore } from '../components/Diagram/store';
import { diagramInitialized, nodeDataPropertyChange } from '../components/Diagram/diagramReducer';
import { selectComponent } from '../components/Diagram/diagramThunks';
import { makeSystemNode } from '../__fixtures__/builders';

const makeStoreWithSystems = () => {
  const store = configureAppStore({ flowDiagramData: { name: 'test', diagramNotes: '' } } as WaterDiagram);
  store.dispatch(diagramInitialized({
    diagramData: { name: 't', nodes: [makeSystemNode('sysA'), makeSystemNode('sysB')], edges: [], diagramFlowErrors: {}, userDiagramOptions: undefined, settings: undefined, calculatedData: { nodes: {} }, recentNodeColors: [], recentEdgeColors: [] } as any,
    parentContainer: { height: 0, headerHeight: 0, footerHeight: 0 },
    assessmentId: undefined,
  }));
  return store;
};

const getNodeName = (store: ReturnType<typeof makeStoreWithSystems>, id: string) =>
  store.getState().diagram.nodes.find((n) => n.data.diagramNodeId === id).data.name;

describe('nodeDataPropertyChange - node targeting', () => {
  it('writes to the nodeId node, not the selected node (debounced write landing after selection changed)', () => {
    const store = makeStoreWithSystems();
    store.dispatch(selectComponent('sysB') as any);

    store.dispatch(nodeDataPropertyChange({ optionsProp: 'name', updatedValue: 'edited A', nodeId: 'sysA' }));

    expect(getNodeName(store, 'sysA')).toBe('edited A');
    expect(getNodeName(store, 'sysB')).toBe('sysB');
  });

  it('falls back to the selected node when nodeId is omitted', () => {
    const store = makeStoreWithSystems();
    store.dispatch(selectComponent('sysB') as any);

    store.dispatch(nodeDataPropertyChange({ optionsProp: 'name', updatedValue: 'edited B' }));

    expect(getNodeName(store, 'sysA')).toBe('sysA');
    expect(getNodeName(store, 'sysB')).toBe('edited B');
  });
});
