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

  it('buildEstimateForm → getEstimateDataFromForm round-trips leakPressure and turbineEfficiency', () => {
    const leak = service.getEmptySteamLeakData();
    leak.estimateMethodData.leakPressure = 200;
    leak.estimateMethodData.turbineEfficiency = 80;

    const form = service.buildEstimateForm(leak);
    const result = service.getEstimateDataFromForm(form);

    expect(result.leakPressure).toBe(200);
    expect(result.turbineEfficiency).toBe(80);
  });

  // ─── Estimate method maxSteamTemp parameter ──────────────────────────────────

  it('buildEstimateForm marks leakTemperature invalid when it exceeds the provided maxSteamTemp', () => {
    const leak = service.getEmptySteamLeakData();
    leak.estimateMethodData.leakTemperature = 450;

    const form = service.buildEstimateForm(leak, undefined, 400);

    expect(form.controls.leakTemperature.valid).toBeFalse();
  });

  it('buildEstimateForm accepts leakTemperature at the maxSteamTemp boundary', () => {
    const leak = service.getEmptySteamLeakData();
    leak.estimateMethodData.leakTemperature = 400;

    const form = service.buildEstimateForm(leak, undefined, 400);

    expect(form.controls.leakTemperature.valid).toBeTrue();
  });

  it('buildEstimateForm has no upper temperature bound when maxSteamTemp is not provided', () => {
    const leak = service.getEmptySteamLeakData();
    leak.estimateMethodData.leakTemperature = 600;

    const form = service.buildEstimateForm(leak);

    expect(form.controls.leakTemperature.valid).toBeTrue();
  });

  it('buildOrificeForm → getOrificeDataFromForm round-trips all fields', () => {
    const leak = service.getEmptySteamLeakData();
    leak.orificeMethodData = {
      holeSize: 0.5,
      dischargeCoefficient: 0.61,
      atmosphericPressure: 14.7,
      leakPressure: 200,
      leakTemperature: 350,
      pressureReductionMethod: 0,
      turbineEfficiency: 80,
      costOfElectricity: 0.1,
    };

    const form = service.buildOrificeForm(leak);
    const result = service.getOrificeDataFromForm(form);

    expect(result.holeSize).toBe(0.5);
    expect(result.dischargeCoefficient).toBe(0.61);
    expect(result.atmosphericPressure).toBe(14.7);
    expect(result.leakPressure).toBe(200);
    expect(result.leakTemperature).toBe(350);
    expect(result.turbineEfficiency).toBe(80);
  });

  // ─── Orifice method maxSteamTemp parameter ───────────────────────────────────

  it('buildOrificeForm marks leakTemperature invalid when it exceeds the provided maxSteamTemp', () => {
    const leak = service.getEmptySteamLeakData();
    leak.orificeMethodData.leakTemperature = 450;

    const form = service.buildOrificeForm(leak, undefined, 400);

    expect(form.controls.leakTemperature.valid).toBeFalse();
  });

  it('buildOrificeForm accepts leakTemperature at the maxSteamTemp boundary', () => {
    const leak = service.getEmptySteamLeakData();
    leak.orificeMethodData.leakTemperature = 400;

    const form = service.buildOrificeForm(leak, undefined, 400);

    expect(form.controls.leakTemperature.valid).toBeTrue();
  });

  it('buildOrificeForm has no upper temperature bound when maxSteamTemp is not provided', () => {
    const leak = service.getEmptySteamLeakData();
    leak.orificeMethodData.leakTemperature = 600;

    const form = service.buildOrificeForm(leak);

    expect(form.controls.leakTemperature.valid).toBeTrue();
  });

  it('buildPlumeForm → getPlumeDataFromForm round-trips all fields', () => {
    const leak = service.getEmptySteamLeakData();
    leak.plumeMethodData = {
      leakPressure: 200,
      leakTemperature: 350,
      ambientTemperature: 72,
      plumeLength: 6,
      pressureReductionMethod: 0,
      turbineEfficiency: 0,
      costOfElectricity: 0.1,
    };

    const form = service.buildPlumeForm(leak);
    const result = service.getPlumeDataFromForm(form);

    expect(result.leakPressure).toBe(200);
    expect(result.leakTemperature).toBe(350);
    expect(result.ambientTemperature).toBe(72);
    expect(result.plumeLength).toBe(6);
  });

  // ─── Plume method maxSteamTemp parameter ─────────────────────────────────────

  it('buildPlumeForm marks leakTemperature invalid when it exceeds the provided maxSteamTemp', () => {
    const leak = service.getEmptySteamLeakData();
    leak.plumeMethodData.leakTemperature = 450;

    const form = service.buildPlumeForm(leak, undefined, 400);

    expect(form.controls.leakTemperature.valid).toBeFalse();
    expect(form.valid).toBeFalse();
  });

  it('buildPlumeForm accepts leakTemperature at the maxSteamTemp boundary', () => {
    const leak = service.getEmptySteamLeakData();
    leak.plumeMethodData.leakTemperature = 400;

    const form = service.buildPlumeForm(leak, undefined, 400);

    expect(form.controls.leakTemperature.valid).toBeTrue();
  });

  it('buildPlumeForm has no upper temperature bound when maxSteamTemp is not provided', () => {
    const leak = service.getEmptySteamLeakData();
    leak.plumeMethodData.leakTemperature = 600;

    const form = service.buildPlumeForm(leak);

    expect(form.controls.leakTemperature.valid).toBeTrue();
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

  it('buildFacilitySteamLeakForm accepts steamPressure of zero', () => {
    const data = { ...validFacilityData(), steamPressure: 0 };
    const form = service.buildFacilitySteamLeakForm(data);

    expect(form.controls.steamPressure.valid).toBeTrue();
  });

  it('buildFacilitySteamLeakForm is invalid when steamPressure is negative', () => {
    const data = { ...validFacilityData(), steamPressure: -1 };
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

  // These three fields changed from greaterThan(0) → min(0); zero must now be valid,
  // negative must still be rejected.

  it('buildFacilitySteamLeakForm accepts electricityCost of zero', () => {
    const form = service.buildFacilitySteamLeakForm({ ...validFacilityData(), electricityCost: 0 });
    expect(form.controls.electricityCost.valid).toBeTrue();
  });

  it('buildFacilitySteamLeakForm is invalid when electricityCost is negative', () => {
    const form = service.buildFacilitySteamLeakForm({ ...validFacilityData(), electricityCost: -0.01 });
    expect(form.controls.electricityCost.valid).toBeFalse();
  });

  it('buildFacilitySteamLeakForm accepts fuelCost of zero', () => {
    const form = service.buildFacilitySteamLeakForm({ ...validFacilityData(), fuelCost: 0 });
    expect(form.controls.fuelCost.valid).toBeTrue();
  });

  it('buildFacilitySteamLeakForm is invalid when fuelCost is negative', () => {
    const form = service.buildFacilitySteamLeakForm({ ...validFacilityData(), fuelCost: -1 });
    expect(form.controls.fuelCost.valid).toBeFalse();
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
    electricityCost: 0.1,
    boilerEfficiency: 80,
    systemEfficiency: 75,
  };
}
