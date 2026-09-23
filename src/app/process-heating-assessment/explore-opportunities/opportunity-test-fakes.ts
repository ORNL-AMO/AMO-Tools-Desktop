import { signal, WritableSignal } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { PHAST } from '../models/phast';
import { ProcessHeatingModification, ScenarioOverrides } from '../models/modification';
import { getEffectivePhast } from '../services/scenario-merge.util';

/** Spec-only stand-in for `ProcessHeatingAssessmentService`: real merge, in-memory state. */
export class FakeProcessHeatingAssessmentService {
  readonly processHeatingSignal: WritableSignal<PHAST>;
  readonly settingsSignal: WritableSignal<Settings> = signal<Settings>({ unitsOfMeasure: 'Imperial' } as Settings);

  constructor(baseline: PHAST = { losses: {}, modifications: [] }) {
    this.processHeatingSignal = signal<PHAST>(baseline);
  }

  updateProcessHeatingProperty<K extends keyof PHAST>(key: K, value: PHAST[K]): void {
    this.processHeatingSignal.set({ ...this.processHeatingSignal(), [key]: value });
  }

  updateModificationProperty<K extends keyof ScenarioOverrides>(modificationId: string, key: K, value: ScenarioOverrides[K]): void {
    const current = this.processHeatingSignal();
    const modifications = (current.modifications ?? []) as ProcessHeatingModification[];
    const index = modifications.findIndex(modification => modification.id === modificationId);
    if (index === -1) return;
    const updated = [...modifications];
    updated[index] = { ...updated[index], scenarioOverrides: { ...updated[index].scenarioOverrides, [key]: value } };
    this.processHeatingSignal.set({ ...current, modifications: updated });
  }

  scenarioPhast(scenario: string): PHAST | undefined {
    const baseline = this.processHeatingSignal();
    if (scenario === 'baseline') {
      return baseline;
    }
    const modifications = (baseline.modifications ?? []) as ProcessHeatingModification[];
    const modification = modifications.find(candidate => candidate.id === scenario);
    return modification ? getEffectivePhast(baseline, modification) : undefined;
  }

  lossSignal(scenario: string, lossKey: keyof PHAST['losses']) {
    return this.scenarioPhast(scenario)?.losses?.[lossKey];
  }
}

export class FakeProcessHeatingUiService {
  activeModificationIdSignal: WritableSignal<string | undefined> = signal<string | undefined>(undefined);
}
