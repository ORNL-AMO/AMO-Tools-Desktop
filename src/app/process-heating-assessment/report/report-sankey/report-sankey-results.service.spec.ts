import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PHAST as SharedPHAST } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { SankeyResultsService, SankeyScenario } from '../../sankey/sankey-results.service';
import { ExecutiveSummaryResultsService, ScenarioSavings } from '../executive-summary/executive-summary-results.service';
import { ReportSankeyResultsService } from './report-sankey-results.service';

describe('ReportSankeyResultsService', () => {
  let service: ReportSankeyResultsService;
  let savings: WritableSignal<Record<string, ScenarioSavings>>;
  let scenarios: SankeyScenario[];

  beforeEach(() => {
    savings = signal({ baseline: { costSavings: 0, energySavings: 0 }, mod1: { costSavings: 10000, energySavings: 2000 } });
    scenarios = [
      { id: 'baseline', name: 'Baseline', phast: { name: 'baseline' } as SharedPHAST },
      { id: 'mod1', name: 'Scenario 1', phast: { name: 'mod1' } as SharedPHAST },
    ];
    TestBed.configureTestingModule({
      providers: [
        ReportSankeyResultsService,
        {
          provide: SankeyResultsService,
          useValue: { settings: signal<Partial<Settings>>({ energyResultUnit: 'MMBtu' }), scenarios: signal(scenarios) },
        },
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

  it('keeps the shared scenario phast reference so sankey validity can identify the scenario', () => {
    expect(service.reportSankeyUI().scenarios[0].phast).toBe(scenarios[0].phast);
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
