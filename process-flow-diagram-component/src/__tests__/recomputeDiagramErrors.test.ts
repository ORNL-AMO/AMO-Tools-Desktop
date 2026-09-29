/**
 * Guards the link between `RECOMPUTES_DIAGRAM_ERRORS` (diagramReducer.ts) — the exhaustive,
 * per-action classification of whether an action can leave `diagramFlowErrors` stale — and the
 * `structuralDiagramActionMatcher` listener matcher (store.ts) that is derived from it.
 *
 * `Record<DiagramActionType, boolean>` already forces every action to be classified at compile
 * time. This test is the runtime backstop: it fails if the matcher and the map ever disagree,
 * which can only happen if someone hand-edits the matcher instead of the classification, or
 * widens the Record's type (e.g. `as any`) to dodge the compile-time check.
 */
import { describe, it, expect } from 'vitest';
import { diagramSlice, RECOMPUTES_DIAGRAM_ERRORS, DiagramActionType } from '../components/Diagram/diagramReducer';
import { getStructuralDiagramActionMatcher } from '../components/Diagram/store';

type LooseActionCreator = (payload?: unknown) => { type: string };

describe('RECOMPUTES_DIAGRAM_ERRORS classification', () => {
  it('has exactly one entry per diagram action', () => {
    // Catches a `Record<string, boolean>` / `as any` widening that would defeat the
    // compile-time exhaustiveness the `Record<DiagramActionType, boolean>` type provides.
    expect(Object.keys(RECOMPUTES_DIAGRAM_ERRORS).sort())
      .toEqual(Object.keys(diagramSlice.actions).sort());
  });

  it('the recompute-errors listener matches exactly the actions classified as structural', () => {
    const matcher = getStructuralDiagramActionMatcher();
    for (const [name, actionCreator] of Object.entries(diagramSlice.actions)) {
      const isStructural = RECOMPUTES_DIAGRAM_ERRORS[name as DiagramActionType];
      // The matcher only inspects `action.type`, so an undefined payload is safe here even
      // where the real payload type is required.
      const sampleAction = (actionCreator as LooseActionCreator)(undefined);
      expect(
        matcher(sampleAction),
        `expected structuralDiagramActionMatcher(${name}) to be ${isStructural} per RECOMPUTES_DIAGRAM_ERRORS`
      ).toBe(isStructural);
    }
  });
});
