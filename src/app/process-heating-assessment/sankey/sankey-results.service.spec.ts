import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Settings } from '../../shared/models/settings';
import { ProcessHeatingModification } from '../models/modification';
import { PHAST } from '../models/phast';
import { ModificationService } from '../services/modification.service';
import { ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';
import { SankeyResultsService } from './sankey-results.service';

describe('SankeyResultsService', () => {
  let service: SankeyResultsService;
  let modifications: WritableSignal<ProcessHeatingModification[]>;
  let scenarioPhasts: Record<string, PHAST>;

  beforeEach(() => {
    modifications = signal<ProcessHeatingModification[]>([{ id: 'mod1', scenarioOverrides: { name: 'Scenario 1' } }]);
    scenarioPhasts = { baseline: { name: 'baseline' } as PHAST, mod1: { name: 'mod1' } as PHAST };
    TestBed.configureTestingModule({
      providers: [
        SankeyResultsService,
        {
          provide: ProcessHeatingAssessmentService,
          useValue: {
            settingsSignal: signal<Partial<Settings>>({ energyResultUnit: 'MMBtu' }),
            scenarioPhastSignal: (id: string) => scenarioPhasts[id],
          },
        },
        { provide: ModificationService, useValue: { modifications } },
      ],
    });
    service = TestBed.inject(SankeyResultsService);
  });

  it('lists the baseline then each modification by name', () => {
    expect(service.scenarios().map(({ id, name }) => ({ id, name }))).toEqual([
      { id: 'baseline', name: 'Baseline' },
      { id: 'mod1', name: 'Scenario 1' },
    ]);
  });

  it('passes the shared sankey a copy of the scenario, not the signal value', () => {
    const [baseline] = service.scenarios();
    expect((baseline.phast as unknown as PHAST).name).toBe('baseline');
    expect(baseline.phast as unknown).not.toBe(scenarioPhasts['baseline']);
  });

  it('updates when modifications change', () => {
    modifications.set([]);
    expect(service.scenarios().map(scenario => scenario.id)).toEqual(['baseline']);
  });
});
