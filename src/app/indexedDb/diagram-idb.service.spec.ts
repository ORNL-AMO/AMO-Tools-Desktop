import { DiagramIdbService } from './diagram-idb.service';
import { Diagram } from '../shared/models/diagram';

const makeDiagram = (id: number, name: string): Diagram => ({ id, name } as unknown as Diagram);

describe('DiagramIdbService.upsertInCache', () => {
  let service: DiagramIdbService;

  beforeEach(() => {
    service = new DiagramIdbService(null);
  });

  it('adds a diagram that is not cached yet, including when the cache was never loaded', () => {
    service.upsertInCache(makeDiagram(1, 'first'));
    expect(service.allDiagrams.map((diagram) => diagram.id)).toEqual([1]);
  });

  it('replaces the cached diagram with the same id and keeps the others in order', () => {
    service.allDiagrams = [makeDiagram(1, 'one'), makeDiagram(2, 'two'), makeDiagram(3, 'three')];
    service.upsertInCache(makeDiagram(2, 'updated'));
    expect(service.allDiagrams.map((diagram) => diagram.name)).toEqual(['one', 'updated', 'three']);
  });

  it('stores a copy, so later edits to the saved object do not reach the cache', () => {
    const saved = makeDiagram(1, 'saved');
    service.upsertInCache(saved);
    saved.name = 'edited later';
    expect(service.findById(1).name).toBe('saved');
  });

  it('emits a new array to subscribers', () => {
    service.allDiagrams = [makeDiagram(1, 'one')];
    const previous = service.allDiagrams;
    let emitted: Diagram[];
    service.dbDiagrams.subscribe((diagrams) => emitted = diagrams);
    service.upsertInCache(makeDiagram(1, 'updated'));
    expect(emitted).toBe(service.allDiagrams);
    expect(emitted).not.toBe(previous);
  });
});
