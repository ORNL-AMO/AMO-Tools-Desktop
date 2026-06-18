import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { SteamLeakSurveyService } from './steam-leak-survey-service';
import { ConvertSteamLeakService } from './convert-steam-leak.service';
import { StandaloneService } from '../../standalone.service';
import { SteamLeakSurveyFormService } from './steam-leak-survey-form/steam-leak-survey-form.service';
import { Settings } from '../../../shared/models/settings';
import { SteamLeakSurveyData, SteamLeakSurveyInput, SteamLeakSurveyResult } from '../../../shared/models/standalone';
import { SteamLeakMeasurementMethod, SteamLeakUtilityType } from './steam-leak-constants';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';

describe('SteamLeakSurveyService', () => {
  let service: SteamLeakSurveyService;
  let convertSteamLeakService: jasmine.SpyObj<ConvertSteamLeakService>;
  let standaloneService: jasmine.SpyObj<StandaloneService>;
  const settings = { unitsOfMeasure: 'Imperial' } as Settings;
  const emptyResult: SteamLeakSurveyResult = { leakRate: 0, steamLoss: 0, energyLoss: 0, leakCost: 0 };

  beforeEach(() => {
    convertSteamLeakService = jasmine.createSpyObj('ConvertSteamLeakService', [
      'convertInputs', 'convertFacilityInputs', 'convertResult', 'convertExample',
      'convertImperialFacilitySteamLeakData', 'convertFacilitySteamLeakData',
      'convertInputDataImperialToMetric', 'convertInputDataMetricToImperial',
    ]);
    convertSteamLeakService.convertInputs.and.callFake(() => {});
    convertSteamLeakService.convertFacilityInputs.and.callFake((v: any) => v);
    convertSteamLeakService.convertResult.and.callFake((v: SteamLeakSurveyResult) => v);
    convertSteamLeakService.convertExample.and.callFake((v: SteamLeakSurveyInput) => v);
    convertSteamLeakService.convertImperialFacilitySteamLeakData.and.callFake((v: any) => v);
    convertSteamLeakService.convertFacilitySteamLeakData.and.callFake((v: any) => v);

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

  // ─── output() reactive signal guard ─────────────────────────────────────────

  it('returns empty output when settings have not been initialized', () => {
    service.steamLeakInput.set(getInput([getLeak('Leak A', true)]));
    const output = service.output();

    expect(output.baselineTotal).toEqual(emptyResult);
    expect(output.modificationTotal).toEqual(emptyResult);
    expect(output.savings).toEqual(emptyResult);
  });

  it('returns empty output when steamLeakInput is undefined', () => {
    service.settings = settings;
    service.steamLeakInput.set(undefined);
    const output = service.output();

    expect(output.baselineTotal).toEqual(emptyResult);
    expect(standaloneService.steamLeakSurvey).not.toHaveBeenCalled();
  });

  it('returns empty output when facility form is invalid', () => {
    service.settings = settings;
    const invalid = getInput([getLeak('Leak A', true)]);
    (invalid.facilitySteamLeakData as any).annualOperatingHours = null;
    service.steamLeakInput.set(invalid);

    const output = service.output();

    expect(output.baselineTotal).toEqual(emptyResult);
    expect(standaloneService.steamLeakSurvey).not.toHaveBeenCalled();
  });

  // ─── getResults() aggregation ────────────────────────────────────────────────

  it('aggregates baseline and savings across multiple leaks', () => {
    service.settings = settings;
    standaloneService.steamLeakSurvey.and.callFake((inputObj: SteamLeakSurveyInput) => {
      const name = inputObj.steamLeakSurveyInputVec[0].name;
      if (name === 'Leak A') {
        return { leakRate: 10, steamLoss: 1000, energyLoss: 100, leakCost: 200 };
      }
      return { leakRate: 5, steamLoss: 500, energyLoss: 50, leakCost: 100 };
    });

    const output = service.getResults(settings, getInput([getLeak('Leak A', true), getLeak('Leak B', true)]));

    expect(output.baselineTotal).toEqual({ leakRate: 15, steamLoss: 1500, energyLoss: 150, leakCost: 300 });
    expect(output.savings).toEqual({ leakRate: 15, steamLoss: 1500, energyLoss: 150, leakCost: 300 });
    expect(output.individualLeaks.length).toBe(2);
  });

  it('accumulates unselected leaks into modification total', () => {
    service.settings = settings;
    standaloneService.steamLeakSurvey.and.callFake((inputObj: SteamLeakSurveyInput) => {
      const name = inputObj.steamLeakSurveyInputVec[0].name;
      if (name === 'Leak A') {
        return { leakRate: 10, steamLoss: 1000, energyLoss: 100, leakCost: 200 };
      }
      // Leak B is unselected — repair not planned, remains as modification cost
      return { leakRate: 5, steamLoss: 500, energyLoss: 50, leakCost: 100 };
    });

    const output = service.getResults(settings, getInput([getLeak('Leak A', true), getLeak('Leak B', false)]));

    expect(output.baselineTotal).toEqual({ leakRate: 15, steamLoss: 1500, energyLoss: 150, leakCost: 300 });
    expect(output.modificationTotal).toEqual({ leakRate: 5, steamLoss: 500, energyLoss: 50, leakCost: 100 });
    expect(output.savings).toEqual({ leakRate: 10, steamLoss: 1000, energyLoss: 100, leakCost: 200 });
    expect(output.individualLeaks.length).toBe(2);
  });

  it('returns zero totals when the leak array is empty', () => {
    service.settings = settings;

    const output = service.getResults(settings, getInput([]));

    expect(output.baselineTotal).toEqual(emptyResult);
    expect(output.savings).toEqual(emptyResult);
    expect(standaloneService.steamLeakSurvey).not.toHaveBeenCalled();
  });

  // ─── Golden output regression ────────────────────────────────────────────────
  // Locks in the aggregation and baseline/modification split for a multi-leak example.
  // StandaloneService is mocked with fixed per-leak values — what is tested here is
  // the getResults() aggregation logic, not the WASM steam calculations.
  describe('golden output — example data', () => {
    const perLeakResults: Record<string, SteamLeakSurveyResult> = {
      'Estimate Leak': { leakRate: 100, steamLoss: 10000, energyLoss: 1000, leakCost: 300 },
      'Orifice Leak':  { leakRate: 50,  steamLoss: 5000,  energyLoss: 500,  leakCost: 150 },
      'Plume Leak':    { leakRate: 25,  steamLoss: 2500,  energyLoss: 250,  leakCost: 75  },
    };

    beforeEach(() => {
      service.settings = settings;
      standaloneService.steamLeakSurvey.and.callFake((input: SteamLeakSurveyInput) =>
        ({ ...perLeakResults[input.steamLeakSurveyInputVec[0].name] })
      );
    });

    it('all leaks selected: baseline equals sum of all per-leak results', () => {
      const leaks = [
        getLeak('Estimate Leak', true),
        getLeak('Orifice Leak', true),
        getLeak('Plume Leak', true),
      ];
      const output = service.getResults(settings, getInput(leaks));

      expect(output.baselineTotal).toEqual({ leakRate: 175, steamLoss: 17500, energyLoss: 1750, leakCost: 525 });
      expect(output.modificationTotal).toEqual(emptyResult);
      expect(output.savings).toEqual({ leakRate: 175, steamLoss: 17500, energyLoss: 1750, leakCost: 525 });
      expect(output.individualLeaks.map(l => l.name)).toEqual(['Estimate Leak', 'Orifice Leak', 'Plume Leak']);
    });

    it('partial fix: unselected leaks accumulate into modification total', () => {
      const leaks = [
        getLeak('Estimate Leak', true),
        getLeak('Orifice Leak', false),
        getLeak('Plume Leak', true),
      ];
      const output = service.getResults(settings, getInput(leaks));

      expect(output.baselineTotal).toEqual({ leakRate: 175, steamLoss: 17500, energyLoss: 1750, leakCost: 525 });
      expect(output.modificationTotal).toEqual({ leakRate: 50, steamLoss: 5000, energyLoss: 500, leakCost: 150 });
      expect(output.savings).toEqual({ leakRate: 125, steamLoss: 12500, energyLoss: 1250, leakCost: 375 });
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
      // currentLeakIndex was 2, deleted index 1 → should decrement to 1
      expect(service.currentLeakIndex()).toBe(1);
    });

    it('deleteLeak resets to empty inputs when removing the only remaining leak', () => {
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

    it('generateExampleData populates 1 example leak and does not convert for Imperial settings', () => {
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

function getInput(leaks: Array<SteamLeakSurveyData>): SteamLeakSurveyInput {
  return {
    steamLeakSurveyInputVec: leaks,
    facilitySteamLeakData: {
      annualOperatingHours: 8760,
      utilityType: SteamLeakUtilityType.Electric,
      steamCost: 0,
      steamTemperature: 500,
      steamPressure: 300,
      feedwaterTemperature: 70,
      fuelCost: 15.5,
      fuelEnergyFactor: 1.038,
      electricityCost: 0.1,
      boilerEfficiency: 80,
      systemEfficiency: 75,
    }
  };
}

function getLeak(name: string, selected: boolean): SteamLeakSurveyData {
  return {
    selected,
    name,
    leakDescription: `${name} description`,
    measurementMethod: SteamLeakMeasurementMethod.Estimate,
    estimateMethodData: { steamPressure: 300, steamTemperature: 500, pressureReductionMethod: 0, turbineEfficiency: 80, leakRate: 100 },
    estimateTurbineMethodData: { turbineEfficiency: 80, leakRate: 100 },
    orificeMethodData: { holeSize: 0.25, dischargeCoefficient: 0.61, atmosphericPressure: 14.7, steamPressure: 300, steamTemperature: 500, pressureReductionMethod: 0, turbineEfficiency: 80 },
    plumeMethodData: { steamPressure: 300, steamTemperature: 400, ambientTemperature: 70, plumeLength: 6, pressureReductionMethod: 0, turbineEfficiency: 0 },
    units: 0,
  };
}
