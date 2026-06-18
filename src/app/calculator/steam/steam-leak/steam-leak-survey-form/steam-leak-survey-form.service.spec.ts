import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { SteamLeakSurveyFormService } from './steam-leak-survey-form.service';
import { ConvertSteamLeakService } from '../convert-steam-leak.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { SteamLeakUtilityType } from '../steam-leak-constants';

describe('SteamLeakSurveyFormService', () => {
  let service: SteamLeakSurveyFormService;

  beforeEach(() => {
    const convertSteamLeakSpy = jasmine.createSpyObj('ConvertSteamLeakService', ['convertInputDataImperialToMetric']);
    convertSteamLeakSpy.convertInputDataImperialToMetric.and.callFake((v: any) => v);

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        SteamLeakSurveyFormService,
        { provide: ConvertSteamLeakService, useValue: convertSteamLeakSpy },
        { provide: ConvertUnitsService, useValue: jasmine.createSpyObj('ConvertUnitsService', ['value']) },
      ]
    });

    service = TestBed.inject(SteamLeakSurveyFormService);
  });

  it('getEmptySteamLeakData returns an object with all required sub-data shapes', () => {
    const data = service.getEmptySteamLeakData();

    expect(data.name).toBeDefined();
    expect(data.leakDescription).toBeDefined();
    expect(data.measurementMethod).toBeDefined();
    expect(data.estimateMethodData).toBeDefined();
    expect(data.orificeMethodData).toBeDefined();
    expect(data.plumeMethodData).toBeDefined();
    expect(data.units).toBeDefined();
  });

  it('buildLeakMetaForm is invalid when name is empty', () => {
    const leak = service.getEmptySteamLeakData();
    leak.name = '';

    const form = service.buildLeakMetaForm(leak);

    expect(form.controls.name.valid).toBeFalse();
    expect(form.valid).toBeFalse();
  });

  it('buildLeakMetaForm is valid for a complete leak', () => {
    const leak = service.getEmptySteamLeakData();
    leak.name = 'Valid Leak';
    leak.leakDescription = 'Some description';

    const form = service.buildLeakMetaForm(leak);

    expect(form.valid).toBeTrue();
  });

  it('buildEstimateForm → getEstimateDataFromForm round-trips leakRate', () => {
    const leak = service.getEmptySteamLeakData();
    leak.estimateMethodData.leakRate = 75;

    const form = service.buildEstimateForm(leak);
    const result = service.getEstimateDataFromForm(form);

    expect(result.leakRate).toBe(75);
  });

  it('buildEstimateForm → getEstimateDataFromForm round-trips steamPressure and turbineEfficiency', () => {
    const leak = service.getEmptySteamLeakData();
    leak.estimateMethodData.steamPressure = 200;
    leak.estimateMethodData.turbineEfficiency = 80;

    const form = service.buildEstimateForm(leak);
    const result = service.getEstimateDataFromForm(form);

    expect(result.steamPressure).toBe(200);
    expect(result.turbineEfficiency).toBe(80);
  });

  it('buildOrificeForm → getOrificeDataFromForm round-trips all fields', () => {
    const leak = service.getEmptySteamLeakData();
    leak.orificeMethodData = {
      holeSize: 0.5,
      dischargeCoefficient: 0.61,
      atmosphericPressure: 14.7,
      steamPressure: 200,
      steamTemperature: 350,
      pressureReductionMethod: 0,
      turbineEfficiency: 80,
    };

    const form = service.buildOrificeForm(leak);
    const result = service.getOrificeDataFromForm(form);

    expect(result.holeSize).toBe(0.5);
    expect(result.dischargeCoefficient).toBe(0.61);
    expect(result.atmosphericPressure).toBe(14.7);
    expect(result.steamPressure).toBe(200);
    expect(result.steamTemperature).toBe(350);
    expect(result.turbineEfficiency).toBe(80);
  });

  it('buildPlumeForm → getPlumeDataFromForm round-trips all fields', () => {
    const leak = service.getEmptySteamLeakData();
    leak.plumeMethodData = {
      steamPressure: 200,
      steamTemperature: 350,
      ambientTemperature: 72,
      plumeLength: 6,
      pressureReductionMethod: 0,
      turbineEfficiency: 0,
    };

    const form = service.buildPlumeForm(leak);
    const result = service.getPlumeDataFromForm(form);

    expect(result.steamPressure).toBe(200);
    expect(result.steamTemperature).toBe(350);
    expect(result.ambientTemperature).toBe(72);
    expect(result.plumeLength).toBe(6);
  });

  // ─── Plume method steamTemperature cap (482°F / 250°C) ───────────────────────
  // This validator guards against conditions where plume measurement is inaccurate.
  // Example data ships with steamTemperature=500 which exceeds this limit and would
  // silently block the Plume calculation if not caught here.

  it('buildPlumeForm marks steamTemperature invalid when above the 482°F maximum', () => {
    const leak = service.getEmptySteamLeakData();
    leak.plumeMethodData.steamTemperature = 500;

    const form = service.buildPlumeForm(leak);

    expect(form.controls.steamTemperature.valid).toBeFalse();
    expect(form.valid).toBeFalse();
  });

  it('buildPlumeForm accepts steamTemperature at the 482°F boundary', () => {
    const leak = service.getEmptySteamLeakData();
    leak.plumeMethodData.steamTemperature = 482;

    const form = service.buildPlumeForm(leak);

    expect(form.controls.steamTemperature.valid).toBeTrue();
  });

  // ─── buildFacilitySteamLeakForm ───────────────────────────────────────────────

  it('buildFacilitySteamLeakForm is valid for a complete configuration', () => {
    const form = service.buildFacilitySteamLeakForm(validFacilityData());

    expect(form.valid).toBeTrue();
  });

  it('buildFacilitySteamLeakForm is invalid when annualOperatingHours is null', () => {
    const data = { ...validFacilityData(), annualOperatingHours: null as any };
    const form = service.buildFacilitySteamLeakForm(data);

    expect(form.controls.annualOperatingHours.valid).toBeFalse();
    expect(form.valid).toBeFalse();
  });

  it('buildFacilitySteamLeakForm is invalid when steamPressure is zero', () => {
    const data = { ...validFacilityData(), steamPressure: 0 };
    const form = service.buildFacilitySteamLeakForm(data);

    expect(form.controls.steamPressure.valid).toBeFalse();
    expect(form.valid).toBeFalse();
  });

  it('buildFacilitySteamLeakForm is invalid when feedwaterTemperature exceeds boiling point', () => {
    const data = { ...validFacilityData(), feedwaterTemperature: 213 };
    const form = service.buildFacilitySteamLeakForm(data);

    expect(form.controls.feedwaterTemperature.valid).toBeFalse();
    expect(form.valid).toBeFalse();
  });
});

function validFacilityData() {
  return {
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
  };
}
