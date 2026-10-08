import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DesignedEnergyService } from '../../phast/designed-energy/designed-energy.service';
import { MeteredEnergyService } from '../../phast/metered-energy/metered-energy.service';
import { PhastResultsService } from '../../phast/phast-results.service';
import { Settings } from '../../shared/models/settings';
import { Losses, PHAST, PhastResults } from '../models/phast';
import { ProcessHeatingAssessmentService } from './process-heating-assessment.service';
import { ProcessHeatingResultsService } from './process-heating-results.service';

describe('ProcessHeatingResultsService', () => {
  let service: ProcessHeatingResultsService;
  let settings: WritableSignal<Partial<Settings>>;
  let scenarios: Record<string, WritableSignal<PHAST | undefined>>;
  let legacyGetResults: jasmine.Spy;

  beforeEach(() => {
    settings = signal<Partial<Settings>>({ unitsOfMeasure: 'Imperial' });
    scenarios = {
      baseline: signal<PHAST>({ name: 'baseline', losses: {} as Losses }),
      mod1: signal<PHAST>({ name: 'mod1', losses: {} as Losses }),
    };
    legacyGetResults = jasmine.createSpy('getResults').and.callFake((phast: PHAST) => ({ grossHeatInput: phast.name.length } as PhastResults));

    TestBed.configureTestingModule({
      providers: [
        ProcessHeatingResultsService,
        {
          provide: ProcessHeatingAssessmentService,
          useValue: { settingsSignal: settings, scenarioPhastSignal: (scenario: string) => scenarios[scenario]() },
        },
        { provide: PhastResultsService, useValue: { getResults: legacyGetResults } },
        { provide: MeteredEnergyService, useValue: {} },
        { provide: DesignedEnergyService, useValue: {} },
      ],
    });
    service = TestBed.inject(ProcessHeatingResultsService);
  });

  describe('scenarioResults', () => {
    it('calculates each scenario once across repeated reads and returns the same object', () => {
      const first = service.scenarioResults('baseline');
      const second = service.scenarioResults('baseline');
      service.scenarioResults('mod1');

      expect(second).toBe(first);
      expect(legacyGetResults).toHaveBeenCalledTimes(2);
    });

    it('recalculates only the scenario whose losses changed', () => {
      service.scenarioResults('baseline');
      service.scenarioResults('mod1');
      scenarios.mod1.set({ name: 'mod1-changed', losses: {} as Losses });

      service.scenarioResults('baseline');
      expect(service.scenarioResults('mod1').grossHeatInput).toBe('mod1-changed'.length);
      expect(legacyGetResults).toHaveBeenCalledTimes(3);
    });

    it('recalculates when settings change', () => {
      service.scenarioResults('baseline');
      settings.set({ unitsOfMeasure: 'Metric' });
      service.scenarioResults('baseline');

      expect(legacyGetResults).toHaveBeenCalledTimes(2);
      expect(legacyGetResults.calls.mostRecent().args[1]).toEqual({ unitsOfMeasure: 'Metric' });
    });

    it('is undefined when the scenario has no losses', () => {
      scenarios.mod1.set({ name: 'mod1' } as PHAST);
      expect(service.scenarioResults('mod1')).toBeUndefined();
      expect(legacyGetResults).not.toHaveBeenCalled();
    });
  });
});
