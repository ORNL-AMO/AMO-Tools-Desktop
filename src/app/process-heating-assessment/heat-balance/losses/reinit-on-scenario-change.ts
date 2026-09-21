import { effect, untracked } from '@angular/core';
import { AssessmentScenario } from '../../services/process-heating-assessment.service';

/**
 * Reruns `initFn` on scenario change, not just first render (e.g. Expert View switching
 * modifications). `initFn` is untracked so its own PHAST reads don't also trigger reruns. Call
 * from an injection context (e.g. a component constructor).
 */
export function reinitOnScenarioChange(
  scenario: () => AssessmentScenario,
  initFn: (scenario: AssessmentScenario) => void,
): void {
  effect(() => {
    const current = scenario();
    untracked(() => initFn(current));
  });
}
