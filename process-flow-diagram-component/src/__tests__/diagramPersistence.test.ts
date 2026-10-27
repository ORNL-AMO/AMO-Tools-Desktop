import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FlowDiagramData, WaterDiagram, getDefaultUserDiagramOptions } from 'process-flow-lib';
import { configureAppStore } from '../components/Diagram/store';
import { diagramInitialized, diagramReady, nodesChange, setDiagramNotes, saveDiagramState } from '../components/Diagram/diagramReducer';
import { DIAGRAM_SAVE_DEBOUNCE_MS } from '../components/Diagram/diagramPersistence';
import { makeIntakeNode } from '../__fixtures__/builders';
import packageJson from '../../package.json';

const makeWaterDiagram = (version: string): WaterDiagram => ({
  isValid: true,
  flowDiagramData: {
    name: 'test diagram',
    meta: { version, upgrades: [] },
    nodes: [makeIntakeNode('intake')],
    edges: [],
    diagramFlowErrors: {},
    userDiagramOptions: getDefaultUserDiagramOptions(),
    settings: {} as FlowDiagramData['settings'],
    calculatedData: { nodes: {} },
    recentNodeColors: [],
    recentEdgeColors: [],
    diagramNotes: '',
  },
});

const parentContainer = { height: 500, headerHeight: 0, footerHeight: 0 };

const setup = (version: string = packageJson.version) => {
  const waterDiagram = makeWaterDiagram(version);
  const save = vi.fn();
  const store = configureAppStore(waterDiagram, save);
  const hydrate = () => store.dispatch(diagramInitialized({
    diagramData: waterDiagram.flowDiagramData,
    parentContainer,
    assessmentId: undefined,
    appVersion: packageJson.version,
  }));
  return { store, save, hydrate };
};

const settle = () => vi.advanceTimersByTimeAsync(DIAGRAM_SAVE_DEBOUNCE_MS + 1);

describe('diagram save persistence', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not save changes made before the diagram is ready', async () => {
    const { store, save } = setup();
    store.dispatch(setDiagramNotes('early'));
    await settle();
    expect(save).not.toHaveBeenCalled();
  });

  it('does not save when a diagram is opened without edits', async () => {
    const { store, save, hydrate } = setup();
    hydrate();
    store.dispatch(diagramReady());
    await settle();
    expect(save).not.toHaveBeenCalled();
  });

  it('saves once, with meta and notes, after a burst of changes', async () => {
    const { store, save, hydrate } = setup();
    hydrate();
    store.dispatch(diagramReady());
    store.dispatch(setDiagramNotes('a'));
    store.dispatch(setDiagramNotes('ab'));
    store.dispatch(setDiagramNotes('abc'));
    await settle();
    expect(save).toHaveBeenCalledTimes(1);
    const saved: FlowDiagramData = save.mock.calls[0][0];
    expect(saved.diagramNotes).toBe('abc');
    expect(saved.meta.version).toBe(packageJson.version);
    expect(saved.nodes).toHaveLength(1);
  });

  it('ignores mid-drag position frames and selection, but saves the drag end', async () => {
    const { store, save, hydrate } = setup();
    hydrate();
    store.dispatch(diagramReady());
    store.dispatch(nodesChange([{ type: 'position', id: 'intake', position: { x: 5, y: 5 }, dragging: true }]));
    store.dispatch(nodesChange([{ type: 'select', id: 'intake', selected: true }]));
    await settle();
    expect(save).not.toHaveBeenCalled();

    store.dispatch(nodesChange([{ type: 'position', id: 'intake', position: { x: 9, y: 9 }, dragging: false }]));
    await settle();
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('saves an upgraded diagram even without an edit', async () => {
    const { store, save, hydrate } = setup('0.0.1');
    hydrate();
    store.dispatch(diagramReady());
    await settle();
    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.calls[0][0].meta.upgrades).toHaveLength(1);
  });

  it('still saves an upgraded diagram when the debounce fires before the diagram is ready', async () => {
    const { store, save, hydrate } = setup('0.0.1');
    hydrate();
    await settle();
    expect(save).not.toHaveBeenCalled();
    store.dispatch(diagramReady());
    await settle();
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('does not save on ready for a diagram that was already current', async () => {
    const { store, save, hydrate } = setup();
    hydrate();
    await settle();
    store.dispatch(diagramReady());
    await settle();
    expect(save).not.toHaveBeenCalled();
  });

  it('flushes a pending save immediately and does not save it twice', async () => {
    const { store, save, hydrate } = setup();
    hydrate();
    store.dispatch(diagramReady());
    store.dispatch(setDiagramNotes('pending'));
    await store.dispatch(saveDiagramState());
    expect(save).toHaveBeenCalledTimes(1);
    await settle();
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('flush is a no-op when nothing is pending', async () => {
    const { store, save, hydrate } = setup();
    hydrate();
    store.dispatch(diagramReady());
    await store.dispatch(saveDiagramState());
    expect(save).not.toHaveBeenCalled();
  });
});
