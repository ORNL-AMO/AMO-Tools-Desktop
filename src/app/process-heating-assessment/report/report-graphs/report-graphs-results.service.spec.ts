import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PhastChartsService } from '../../../phast/phast-report/phast-charts.service';
import { ShowResultsCategories } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { ProcessHeatingModification } from '../../models/modification';
import { PhastResults } from '../../models/phast';
import { ModificationService } from '../../services/modification.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { ProcessHeatingResultsService } from '../../services/process-heating-results.service';
import { ReportGraphsResultsService, ReportGraphsUI } from './report-graphs-results.service';

const CATEGORIES = { showFlueGas: true } as ShowResultsCategories;

describe('ReportGraphsResultsService', () => {
  let service: ReportGraphsResultsService;
  let settings: WritableSignal<Partial<Settings>>;
  let resultsByName: Record<string, Partial<PhastResults>>;
  let modifications: WritableSignal<ProcessHeatingModification[]>;
  let chartsService: jasmine.SpyObj<PhastChartsService>;

  function ui(): ReportGraphsUI {
    return service.reportGraphsUI();
  }

  beforeEach(() => {
    settings = signal<Partial<Settings>>({ unitsOfMeasure: 'Imperial' });
    resultsByName = { baseline: { totalWallLoss: 2 }, mod1: { totalWallLoss: 1 } };
    modifications = signal<ProcessHeatingModification[]>([{ id: 'mod1', scenarioOverrides: { name: 'Scenario 1' } }]);
    chartsService = jasmine.createSpyObj<PhastChartsService>('PhastChartsService', ['getLossValuesAndLabels', 'getDeliverValuesAndLabels']);
    chartsService.getLossValuesAndLabels.and.callFake(results => [{ label: 'Wall', value: results.totalWallLoss }]);
    chartsService.getDeliverValuesAndLabels.and.returnValue([]);

    TestBed.configureTestingModule({
      providers: [
        ReportGraphsResultsService,
        {
          provide: ProcessHeatingAssessmentService,
          useValue: { settingsSignal: settings },
        },
        { provide: ModificationService, useValue: { modifications } },
        { provide: PhastChartsService, useValue: chartsService },
        {
          provide: ProcessHeatingResultsService,
          useValue: { scenarioResults: (id: string) => resultsByName[id], getResultCategories: () => CATEGORIES },
        },
      ],
    });
    service = TestBed.inject(ReportGraphsResultsService);
  });

  it('builds baseline and modification scenarios in order', () => {
    expect(ui().scenarios.map(scenario => [scenario.id, scenario.name])).toEqual([['baseline', 'Baseline'], ['mod1', 'Scenario 1']]);
    expect(ui().scenarios[1].lossValuesAndLabels).toEqual([{ label: 'Wall', value: 1 }]);
  });

  it('passes the heating configuration categories to the loss chart data', () => {
    ui();
    expect(chartsService.getLossValuesAndLabels).toHaveBeenCalledWith(jasmine.anything(), CATEGORIES);
  });

  it('uses imperial units', () => {
    expect(ui().lossUnit).toBe('MMBtu/hr');
    expect(ui().barChartYAxisLabel).toBe('Heat Loss (MMBtu/hr)');
    expect(ui().deliverUnit).toBe('kW');
  });

  it('uses metric units', () => {
    settings.set({ unitsOfMeasure: 'Metric' });
    expect(ui().lossUnit).toBe('GJ/hr');
  });

  it('carries delivered heat data for electrotechnology scenarios', () => {
    chartsService.getDeliverValuesAndLabels.and.returnValue([{ label: 'Electrical Energy Input', value: 5 }]);
    expect(ui().scenarios[0].deliverValuesAndLabels).toEqual([{ label: 'Electrical Energy Input', value: 5 }]);
  });

  it('skips modifications without results', () => {
    resultsByName.mod1 = undefined;
    expect(ui().scenarios.map(scenario => scenario.id)).toEqual(['baseline']);
  });

  it('is undefined when the baseline has no results', () => {
    resultsByName.baseline = undefined;
    expect(ui()).toBeUndefined();
  });
});
