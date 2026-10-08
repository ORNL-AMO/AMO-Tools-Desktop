import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Settings } from '../../../shared/models/settings';
import { ProcessHeatingModification } from '../../models/modification';
import { PHAST } from '../../models/phast';
import { ModificationService } from '../../services/modification.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ExecutiveSummaryResultsService, ScenarioSavings } from '../executive-summary/executive-summary-results.service';
import { ReportSankeyResultsService } from './report-sankey-results.service';

describe('ReportSankeyResultsService', () => {
  let service: ReportSankeyResultsService;
  let savings: WritableSignal<Record<string, ScenarioSavings>>;
  let modifications: WritableSignal<ProcessHeatingModification[]>;

  beforeEach(() => {
    savings = signal({ baseline: { costSavings: 0, energySavings: 0 }, mod1: { costSavings: 10000, energySavings: 2000 } });
    modifications = signal<ProcessHeatingModification[]>([{ id: 'mod1', scenarioOverrides: { name: 'Scenario 1' } }]);
    TestBed.configureTestingModule({
      providers: [
        ReportSankeyResultsService,
        {
          provide: ProcessHeatingAssessmentService,
          useValue: {
            settingsSignal: signal<Partial<Settings>>({ energyResultUnit: 'MMBtu' }),
            scenarioPhastSignal: (id: string) => ({ name: id } as PHAST),
          },
        },
        { provide: ModificationService, useValue: { modifications } },
        { provide: ExecutiveSummaryResultsService, useValue: { scenarioSavings: savings } },
      ],
    });
    service = TestBed.inject(ReportSankeyResultsService);
  });

  it('builds a scenario per baseline and modification with savings', () => {
    const ui = service.reportSankeyUI();
    expect(ui.scenarios.map(scenario => scenario.id)).toEqual(['baseline', 'mod1']);
    expect(ui.scenarios[1]).toEqual(jasmine.objectContaining({ name: 'Scenario 1', costSavings: 10000, energySavings: 2000 }));
    expect(ui.energySavingsUnit).toBe('MMBtu/yr');
  });

  it('passes the shared sankey a copy of the scenario, not the signal value', () => {
    const [baseline] = service.reportSankeyUI().scenarios;
    expect((baseline.phast as unknown as PHAST).name).toBe('baseline');
  });

  it('skips modifications without results', () => {
    savings.set({ baseline: { costSavings: 0, energySavings: 0 } });
    expect(service.reportSankeyUI().scenarios.map(scenario => scenario.id)).toEqual(['baseline']);
  });

  it('is undefined when the baseline has no results', () => {
    savings.set({});
    expect(service.reportSankeyUI()).toBeUndefined();
  });
});
