import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DesignedEnergyService } from '../../phast/designed-energy/designed-energy.service';
import { MeteredEnergyService } from '../../phast/metered-energy/metered-energy.service';
import { PhastResultsService } from '../../phast/phast-results.service';
import { ShowResultsCategories } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { Losses, PHAST, PhastResults } from '../models/phast';
import { ProcessHeatingAssessmentService } from './process-heating-assessment.service';
import { ProcessHeatingResultsService } from './process-heating-results.service';
import { combineResultCategories, ResultCategories } from '../models/result-rows';

describe('ProcessHeatingResultsService', () => {
  let service: ProcessHeatingResultsService;
  let settings: WritableSignal<Partial<Settings>>;
  let mod1EnergySource: WritableSignal<Partial<Settings> | undefined>;
  let scenarios: Record<string, WritableSignal<PHAST | undefined>>;
  let legacyGetResults: jasmine.Spy;

  beforeEach(() => {
    settings = signal<Partial<Settings>>({ unitsOfMeasure: 'Imperial' });
    mod1EnergySource = signal<Partial<Settings> | undefined>(undefined);
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
          useValue: {
            settingsSignal: settings,
            scenarioPhastSignal: (scenario: string) => scenarios[scenario](),
            scenarioSettings: (scenario: string) => (scenario === 'mod1' ? { ...settings(), ...mod1EnergySource() } : settings()),
          },
        },
        {
          provide: PhastResultsService,
          useValue: { getResults: legacyGetResults, getResultCategories: (scenarioSettings: Settings) => ({
            showAuxPower: true, showSlag: true, showElectricalDelivered: scenarioSettings.energySourceType === 'Electricity',
          } as ShowResultsCategories) },
        },
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

    it("calculates each scenario with its own energy source", () => {
      mod1EnergySource.set({ energySourceType: 'Electricity' });

      service.scenarioResults('baseline');
      expect(legacyGetResults.calls.mostRecent().args[1]).toEqual({ unitsOfMeasure: 'Imperial' });

      service.scenarioResults('mod1');
      expect(legacyGetResults.calls.mostRecent().args[1]).toEqual({ unitsOfMeasure: 'Imperial', energySourceType: 'Electricity' });
    });

    it('is undefined when the scenario has no losses', () => {
      scenarios.mod1.set({ name: 'mod1' } as PHAST);
      expect(service.scenarioResults('mod1')).toBeUndefined();
      expect(legacyGetResults).not.toHaveBeenCalled();
    });
  });

  describe('auxiliary power', () => {
    it('leaves saved auxiliary power losses out of the legacy calculation', () => {
      const losses = { auxiliaryPowerLosses: [{ supplyVoltage: 480 }], wallLosses: [] } as Losses;
      service.getResults({ name: 'baseline', losses }, settings() as Settings);

      const legacyLosses = legacyGetResults.calls.mostRecent().args[0].losses;
      expect(legacyLosses.auxiliaryPowerLosses).toBeUndefined();
      expect(legacyLosses.wallLosses).toEqual([]);
      expect(losses.auxiliaryPowerLosses.length).toBe(1);
    });

    it('never shows the auxiliary power result category', () => {
      expect(service.getResultCategories(settings() as Settings)).toEqual(jasmine.objectContaining({ showAuxPower: false, showSlag: true }));
    });
  });

  describe('result categories', () => {
    it('splits Electrical Heat Delivered between EAF and other electric furnaces', () => {
      const eaf = service.getResultCategories({ energySourceType: 'Electricity', furnaceType: 'Electric Arc Furnace (EAF)' } as Settings);
      const induction = service.getResultCategories({ energySourceType: 'Electricity', furnaceType: 'Induction Heating and Melting' } as Settings);
      const fuel = service.getResultCategories({ energySourceType: 'Fuel' } as Settings);

      expect([eaf.showEafElectricalDelivered, eaf.showStandardElectricalDelivered]).toEqual([true, false]);
      expect([induction.showEafElectricalDelivered, induction.showStandardElectricalDelivered]).toEqual([false, true]);
      expect([fuel.showEafElectricalDelivered, fuel.showStandardElectricalDelivered]).toEqual([false, false]);
    });

    it("reads each scenario's own energy source", () => {
      mod1EnergySource.set({ energySourceType: 'Electricity' });

      expect(service.scenarioResultCategories('baseline').showElectricalDelivered).toBeFalse();
      expect(service.scenarioResultCategories('mod1').showElectricalDelivered).toBeTrue();
    });

    it('combines categories so a flag is set when any scenario sets it', () => {
      const none = { showSlag: false, showFlueGas: false } as ResultCategories;
      const combined = combineResultCategories([none, { ...none, showSlag: true }, { ...none, showFlueGas: true }]);

      expect(combined.showSlag).toBeTrue();
      expect(combined.showFlueGas).toBeTrue();
      expect(combineResultCategories([none]).showSlag).toBeFalse();
    });
  });

  describe('getCo2EmissionsSavings', () => {
    function results(hourlyTotalEmissionOutput?: number): PhastResults {
      return { co2EmissionsOutput: { hourlyTotalEmissionOutput } } as PhastResults;
    }

    it('subtracts modification from baseline emissions', () => {
      expect(service.getCo2EmissionsSavings(results(10), results(7.5), 'hourlyTotalEmissionOutput')).toBe(2.5);
    });

    it('is undefined when both scenarios have an emissions object with no value', () => {
      expect(service.getCo2EmissionsSavings(results(), results(), 'hourlyTotalEmissionOutput')).toBeUndefined();
    });

    it('is undefined when only one scenario has a value', () => {
      expect(service.getCo2EmissionsSavings(results(10), results(), 'hourlyTotalEmissionOutput')).toBeUndefined();
      expect(service.getCo2EmissionsSavings(results(), results(10), 'hourlyTotalEmissionOutput')).toBeUndefined();
    });

    it('is undefined when a scenario has no emissions object', () => {
      expect(service.getCo2EmissionsSavings({} as PhastResults, results(1), 'hourlyTotalEmissionOutput')).toBeUndefined();
    });

    it('still subtracts when the baseline is zero', () => {
      expect(service.getCo2EmissionsSavings(results(0), results(4), 'hourlyTotalEmissionOutput')).toBe(-4);
    });
  });
});
