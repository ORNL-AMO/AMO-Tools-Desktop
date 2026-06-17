import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { SteamLeakSurveyService } from './steam-leak-survey-service';
import { ConvertSteamLeakService } from './convert-steam-leak.service';
import { StandaloneService } from '../../standalone.service';
import { SteamLeakSurveyFormService } from './steam-leak-survey-form/steam-leak-survey-form.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { FacilitySteamLeakData, SteamLeakSurveyData, SteamLeakSurveyInput, SteamLeakSurveyResult } from '../../../shared/models/standalone';
import { SteamLeakMeasurementMethod } from './steam-leak-constants';

describe('SteamLeakSurveyService', () => {
  let service: SteamLeakSurveyService;
  let convertSteamLeakService: jasmine.SpyObj<ConvertSteamLeakService>;
  let standaloneService: jasmine.SpyObj<StandaloneService>;
  const settings = { unitsOfMeasure: 'Imperial' } as Settings;
  const emptyResult = { leakRate: 0, steamLoss: 0, energyLoss: 0, leakCost: 0 };

  beforeEach(() => {
    convertSteamLeakService = jasmine.createSpyObj('ConvertSteamLeakService', [
      'convertInputs', 'convertFacilityInputs', 'convertResult',
      'convertExample', 'convertImperialFacilitySteamLeakData', 'convertInputDataImperialToMetric',
    ]);
    convertSteamLeakService.convertInputs.and.callFake(() => {});
    convertSteamLeakService.convertFacilityInputs.and.callFake((data: any) => data);
    convertSteamLeakService.convertResult.and.callFake((result: any) => result);
    convertSteamLeakService.convertExample.and.callFake((example: any) => example);
    convertSteamLeakService.convertImperialFacilitySteamLeakData.and.callFake((data: any) => data);
    convertSteamLeakService.convertInputDataImperialToMetric.and.callFake((data: any) => data);

    standaloneService = jasmine.createSpyObj('StandaloneService', ['steamLeakSurvey']);

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        SteamLeakSurveyService,
        SteamLeakSurveyFormService,
        { provide: ConvertSteamLeakService, useValue: convertSteamLeakService },
        { provide: StandaloneService, useValue: standaloneService },
        { provide: ConvertUnitsService, useValue: jasmine.createSpyObj('ConvertUnitsService', ['value']) },
      ]
    });

    service = TestBed.inject(SteamLeakSurveyService);
  });

  it('returns empty output if settings were not initialized', () => {
    service.steamLeakInput.set(getInput([getLeak('Leak A', true)]));
    const output = service.output();

    expect(output.baselineTotal).toEqual(emptyResult);
    expect(output.modificationTotal).toEqual(emptyResult);
    expect(output.savings).toEqual(emptyResult);
  });

  it('returns empty output when facility form is invalid', () => {
    service.settings = settings;
    const invalid = getInput([getLeak('Leak A', true)]);
    invalid.facilitySteamLeakData.annualOperatingHours = null as any;
    service.steamLeakInput.set(invalid);

    const output = service.output();

    expect(output.baselineTotal).toEqual(emptyResult);
    expect(standaloneService.steamLeakSurvey).not.toHaveBeenCalled();
  });

  it('returns zero totals when leak array is empty', () => {
    service.settings = settings;

    const output = service.getResults(settings, getInput([]));

    expect(output.baselineTotal).toEqual(emptyResult);
    expect(output.savings).toEqual(emptyResult);
    expect(standaloneService.steamLeakSurvey).not.toHaveBeenCalled();
  });

  // ─── Golden output ────────────────────────────────────────────────────────────
  // These tests lock in the aggregation logic and baseline/modification/savings
  // split. The WASM engine (StandaloneService) is mocked with fixed per-leak
  // values; what is pinned is getResults() behavior, not the WASM calculations.

  describe('golden output — aggregation', () => {
    const perLeakResults: Record<string, SteamLeakSurveyResult> = {
      'Leak A': { leakRate: 10, steamLoss: 100, energyLoss: 1000, leakCost: 50 },
      'Leak B': { leakRate: 5,  steamLoss: 50,  energyLoss: 500,  leakCost: 25 },
    };

    beforeEach(() => {
      service.settings = settings;
      standaloneService.steamLeakSurvey.and.callFake((input: SteamLeakSurveyInput) =>
        ({ ...perLeakResults[input.steamLeakSurveyInputVec[0].name] })
      );
    });

    it('all leaks selected: aggregates entire baseline into savings, modification is zero', () => {
      const output = service.getResults(settings, getInput([getLeak('Leak A', true), getLeak('Leak B', true)]));

      expect(output.baselineTotal).toEqual({ leakRate: 15, steamLoss: 150, energyLoss: 1500, leakCost: 75 });
      expect(output.savings).toEqual({ leakRate: 15, steamLoss: 150, energyLoss: 1500, leakCost: 75 });
      expect(output.modificationTotal).toEqual(emptyResult);
      expect(output.individualLeaks.length).toBe(2);
      expect(output.individualLeaks.map(l => l.name)).toEqual(['Leak A', 'Leak B']);
      expect(output.individualLeaks.every(l => l.selected)).toBeTrue();
    });

    it('partial fix: unselected leaks accumulate into modification total', () => {
      const output = service.getResults(settings, getInput([getLeak('Leak A', true), getLeak('Leak B', false)]));

      expect(output.baselineTotal).toEqual({ leakRate: 15, steamLoss: 150, energyLoss: 1500, leakCost: 75 });
      expect(output.savings).toEqual({ leakRate: 10, steamLoss: 100, energyLoss: 1000, leakCost: 50 });
      expect(output.modificationTotal).toEqual({ leakRate: 5, steamLoss: 50, energyLoss: 500, leakCost: 25 });
      expect(output.individualLeaks.length).toBe(2);
    });

    it('no leaks selected: savings is zero, modification equals baseline', () => {
      const output = service.getResults(settings, getInput([getLeak('Leak A', false), getLeak('Leak B', false)]));

      expect(output.baselineTotal).toEqual({ leakRate: 15, steamLoss: 150, energyLoss: 1500, leakCost: 75 });
      expect(output.savings).toEqual(emptyResult);
      expect(output.modificationTotal).toEqual({ leakRate: 15, steamLoss: 150, energyLoss: 1500, leakCost: 75 });
    });
  });

  // ─── Service state and lifecycle ─────────────────────────────────────────────

  describe('service state and lifecycle', () => {
    it('deleteLeak removes the correct element and decrements currentLeakIndex when needed', () => {
      service.steamLeakInput.set(getInput([
        getLeak('Leak A', true), getLeak('Leak B', true), getLeak('Leak C', true)
      ]));
      service.currentLeakIndex.set(2);

      service.deleteLeak(1);

      const vec = service.steamLeakInput().steamLeakSurveyInputVec;
      expect(vec.length).toBe(2);
      expect(vec.map(l => l.name)).toEqual(['Leak A', 'Leak C']);
      expect(service.currentLeakIndex()).toBe(1);
    });

    it('deleteLeak resets to empty inputs when removing the only remaining leak', () => {
      service.settings = settings;
      service.steamLeakInput.set(getInput([getLeak('Leak A', true)]));

      service.deleteLeak(0);

      const vec = service.steamLeakInput().steamLeakSurveyInputVec;
      expect(vec.length).toBe(1);
      expect(service.currentLeakIndex()).toBe(0);
    });

    it('copyLeak duplicates the target leak at the end with a "Copy of" prefix', () => {
      service.steamLeakInput.set(getInput([getLeak('Leak A', true), getLeak('Leak B', true)]));

      service.copyLeak(0);

      const vec = service.steamLeakInput().steamLeakSurveyInputVec;
      expect(vec.length).toBe(3);
      expect(vec[2].name).toBe('Copy of Leak A');
      expect(vec[0].name).toBe('Leak A');
      expect(vec[1].name).toBe('Leak B');
    });

    it('generateExampleData populates 1 leak and does not convert for Imperial settings', () => {
      service.generateExampleData(settings);

      expect(service.steamLeakInput().steamLeakSurveyInputVec.length).toBe(1);
      expect(service.currentLeakIndex()).toBe(0);
      expect(convertSteamLeakService.convertExample).not.toHaveBeenCalled();
    });

    it('generateExampleData calls convertExample for Metric settings', () => {
      service.generateExampleData({ unitsOfMeasure: 'Metric' } as Settings);

      expect(convertSteamLeakService.convertExample).toHaveBeenCalled();
    });

    it('setLeakForModification updates the selected state on the correct leak', () => {
      service.steamLeakInput.set(getInput([getLeak('Leak A', false)]));

      service.setLeakForModification(0, true);

      expect(service.steamLeakInput().steamLeakSurveyInputVec[0].selected).toBeTrue();
    });

    it('setLeakForModificationSelectAll toggles all leaks at once', () => {
      service.steamLeakInput.set(getInput([
        getLeak('Leak A', true), getLeak('Leak B', true), getLeak('Leak C', false)
      ]));

      service.setLeakForModificationSelectAll(false);

      const vec = service.steamLeakInput().steamLeakSurveyInputVec;
      expect(vec.every(l => !l.selected)).toBeTrue();
    });
  });
});

function getInput(leaks: SteamLeakSurveyData[]): SteamLeakSurveyInput {
  return {
    steamLeakSurveyInputVec: leaks,
    facilitySteamLeakData: {
      annualOperatingHours: 8760,
      utilityType: 1,
      steamCost: 0,
      steamTemperature: 500,
      steamPressure: 300,
      feedwaterTemperature: 70,
      fuelCost: 15.5,
      fuelEnergyFactor: 1.038,
      electricityCost: 0.1,
      boilerEfficiency: 80,
      systemEfficiency: 75,
    } as FacilitySteamLeakData
  };
}

function getLeak(name: string, selected: boolean): SteamLeakSurveyData {
  return {
    selected,
    name,
    leakDescription: `${name} description`,
    measurementMethod: SteamLeakMeasurementMethod.Estimate,
    estimateMethodData: {
      steamPressure: 115,
      steamTemperature: 212,
      pressureReductionMethod: 0,
      turbineEfficiency: 0,
      leakRate: 1,
    },
    estimateTurbineMethodData: { turbineEfficiency: 0, leakRate: 0 },
    orificeMethodData: {
      holeSize: 0.25,
      dischargeCoefficient: 0.61,
      atmosphericPressure: 14.7,
      steamPressure: 115,
      steamTemperature: 212,
      pressureReductionMethod: 0,
      turbineEfficiency: 0,
    },
    plumeMethodData: {
      steamPressure: 115,
      steamTemperature: 212,
      ambientTemperature: 70,
      plumeLength: 3,
      pressureReductionMethod: 0,
      turbineEfficiency: 0,
    },
    units: 0,
  };
}
