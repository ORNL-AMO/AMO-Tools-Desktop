import { describe, it, expect, vi } from 'vitest';
import { WaterDiagram } from 'process-flow-lib';
import { configureAppStore } from '../components/Diagram/store';
import { deleteNode, deleteEdge, diagramInitialized, resetDiagram, applyEstimatedFlowResults, connectEdge, edgesChangeFromPropagation } from '../components/Diagram/diagramReducer';
import { uiSlice, getDefaultDiagramUiState } from '../components/Diagram/uiSlice';
import { openDrawerWithSelected, selectComponent } from '../components/Diagram/diagramThunks';
import { makeIntakeNode, makeSystemNode, makeEdge } from '../__fixtures__/builders';

const makeStore = () => configureAppStore({ flowDiagramData: { name: 'test', diagramNotes: '' } } as WaterDiagram);

describe('uiSlice defaults', () => {
  it('matches the fields the old DiagramState carried', () => {
    expect(getDefaultDiagramUiState()).toEqual({
      isDataDrawerOpen: false,
      isMenuDrawerOpen: true,
      manageDataTabs: [],
      isDialogOpen: false,
      isModalOpen: false,
      validationWindowLocation: 'diagram',
      diagramAlert: { open: false },
    });
  });
});

describe('uiSlice extraReducers - cross-cutting core actions', () => {
  it('deleteNode/deleteEdge toggle isDataDrawerOpen', () => {
    let state = uiSlice.reducer(undefined, deleteNode('a'));
    expect(state.isDataDrawerOpen).toBe(true);
    state = uiSlice.reducer(state, deleteEdge('e'));
    expect(state.isDataDrawerOpen).toBe(false);
  });

  it('applyEstimatedFlowResults closes the modal', () => {
    const opened = { ...getDefaultDiagramUiState(), isModalOpen: true };
    const result = uiSlice.reducer(opened, applyEstimatedFlowResults({
      totalSourceFlow: 1, totalDischargeFlow: 1, knownLosses: 0, waterInProduct: 0, grossWaterUse: 0,
    }));
    expect(result.isModalOpen).toBe(false);
  });

  it('diagramInitialized resets drawer/dialog/validation-window state', () => {
    const dirty = { ...getDefaultDiagramUiState(), isDataDrawerOpen: true, isDialogOpen: true, validationWindowLocation: 'alerts-tab' as const };
    const result = uiSlice.reducer(dirty, diagramInitialized({
      diagramData: { name: 't', nodes: [], edges: [], diagramFlowErrors: {}, userDiagramOptions: undefined, settings: undefined, calculatedData: { nodes: {} }, recentNodeColors: [], recentEdgeColors: [] } as any,
      parentContainer: { height: 0, headerHeight: 0, footerHeight: 0 },
      assessmentId: undefined,
    }));
    expect(result.isDataDrawerOpen).toBe(false);
    expect(result.isDialogOpen).toBe(false);
    expect(result.validationWindowLocation).toBe('diagram');
  });

  it('resetDiagram returns the slice back to its default state', () => {
    const dirty = { ...getDefaultDiagramUiState(), isModalOpen: true, manageDataTabs: [{} as any] };
    const result = uiSlice.reducer(dirty, resetDiagram());
    expect(result).toEqual(getDefaultDiagramUiState());
  });
});

describe('diagramThunks - selection thunks needing cross-slice data', () => {
  it('selectComponent sets selectedDataId (diagram slice) and manageDataTabs (ui slice) without opening the drawer', () => {
    const store = makeStore();
    const intake = makeIntakeNode('intake');
    // seed nodes directly via diagramInitialized so the thunk has something to look up
    store.dispatch(diagramInitialized({
      diagramData: { name: 't', nodes: [intake], edges: [], diagramFlowErrors: {}, userDiagramOptions: undefined, settings: undefined, calculatedData: { nodes: {} }, recentNodeColors: [], recentEdgeColors: [] } as any,
      parentContainer: { height: 0, headerHeight: 0, footerHeight: 0 },
      assessmentId: undefined,
    }));

    store.dispatch(selectComponent('intake') as any);

    expect(store.getState().diagram.selectedDataId).toBe('intake');
    expect(store.getState().ui.manageDataTabs.length).toBeGreaterThan(0);
    expect(store.getState().ui.isDataDrawerOpen).toBe(false);
  });

  it('openDrawerWithSelected does the same plus forces the drawer open', () => {
    const store = makeStore();
    const system = makeSystemNode('sys');
    store.dispatch(diagramInitialized({
      diagramData: { name: 't', nodes: [system], edges: [], diagramFlowErrors: {}, userDiagramOptions: undefined, settings: undefined, calculatedData: { nodes: {} }, recentNodeColors: [], recentEdgeColors: [] } as any,
      parentContainer: { height: 0, headerHeight: 0, footerHeight: 0 },
      assessmentId: undefined,
    }));

    store.dispatch(openDrawerWithSelected('sys') as any);

    expect(store.getState().diagram.selectedDataId).toBe('sys');
    expect(store.getState().ui.isDataDrawerOpen).toBe(true);
  });
});

describe('listener middleware - UI alerts derived from resulting core state', () => {
  it('dispatches a warning diagramAlert when connectEdge exceeds the connection limit', () => {
    const store = makeStore();
    const existingEdges = [
      makeEdge('n1', 'target', 1), makeEdge('n2', 'target', 1), makeEdge('n3', 'target', 1),
    ].map((e) => ({ ...e, targetHandle: 'a' }));
    store.dispatch(diagramInitialized({
      diagramData: { name: 't', nodes: [], edges: existingEdges, diagramFlowErrors: {}, userDiagramOptions: undefined, settings: undefined, calculatedData: { nodes: {} }, recentNodeColors: [], recentEdgeColors: [] } as any,
      parentContainer: { height: 0, headerHeight: 0, footerHeight: 0 },
      assessmentId: undefined,
    }));

    store.dispatch(connectEdge({ source: 'n4', sourceHandle: 'e', target: 'target', targetHandle: 'a' } as any));

    return vi.waitFor(() => {
      expect(store.getState().ui.diagramAlert.open).toBe(true);
      expect(store.getState().ui.diagramAlert.alertSeverity).toBe('warning');
    });
  });

  it('dispatches a success diagramAlert after a propagation cascade', () => {
    const store = makeStore();
    const source = makeIntakeNode('source');
    const seedEdge = makeEdge('source', 'a', 100);
    store.dispatch(diagramInitialized({
      diagramData: { name: 't', nodes: [source], edges: [seedEdge], diagramFlowErrors: {}, userDiagramOptions: undefined, settings: undefined, calculatedData: { nodes: {} }, recentNodeColors: [], recentEdgeColors: [] } as any,
      parentContainer: { height: 0, headerHeight: 0, footerHeight: 0 },
      assessmentId: undefined,
    }));

    store.dispatch(edgesChangeFromPropagation({
      flowUpdates: { [seedEdge.id]: 100 },
      startingNodeId: 'source',
      initialEdgeId: seedEdge.id,
    }));

    return vi.waitFor(() => {
      expect(store.getState().ui.diagramAlert.open).toBe(true);
      expect(store.getState().ui.diagramAlert.alertSeverity).toBe('success');
      expect(store.getState().ui.diagramAlert.alertMessage).toContain('source');
    });
  });
});
