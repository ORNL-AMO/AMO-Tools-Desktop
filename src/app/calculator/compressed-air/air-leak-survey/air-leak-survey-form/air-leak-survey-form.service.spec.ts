import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { AirLeakSurveyFormService } from './air-leak-survey-form.service';
import { ConvertAirLeakService } from '../convert-air-leak.service';

describe('AirLeakSurveyFormService', () => {
  let service: AirLeakSurveyFormService;

  beforeEach(() => {
    const convertSpy = jasmine.createSpyObj('ConvertAirLeakService', ['convertImperialFacilityCompressorData']);
    convertSpy.convertImperialFacilityCompressorData.and.callFake((v: any) => v);

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        AirLeakSurveyFormService,
        { provide: ConvertAirLeakService, useValue: convertSpy },
      ]
    });

    service = TestBed.inject(AirLeakSurveyFormService);
  });

  it('getEmptyAirLeakData returns an object with all required sub-data shapes', () => {
    const data = service.getEmptyAirLeakData();

    expect(data.name).toBeDefined();
    expect(data.leakDescription).toBeDefined();
    expect(data.measurementMethod).toBeDefined();
    expect(data.estimateMethodData).toBeDefined();
    expect(data.bagMethodData).toBeDefined();
    expect(data.decibelsMethodData).toBeDefined();
    expect(data.orificeMethodData).toBeDefined();
    expect(data.units).toBeDefined();
  });

  it('buildLeakMetaForm is invalid when name is empty', () => {
    const leak = service.getEmptyAirLeakData();
    leak.name = '';

    const form = service.buildLeakMetaForm(leak);

    expect(form.controls.name.valid).toBeFalse();
    expect(form.valid).toBeFalse();
  });

  it('buildLeakMetaForm is valid for a complete leak', () => {
    const leak = service.getEmptyAirLeakData();
    leak.name = 'Valid Leak';
    leak.leakDescription = 'Some description';

    const form = service.buildLeakMetaForm(leak);

    expect(form.valid).toBeTrue();
  });

  it('buildEstimateForm → getEstimateDataFromForm round-trips leakRateEstimate', () => {
    const leak = service.getEmptyAirLeakData();
    leak.estimateMethodData.leakRateEstimate = 0.75;

    const form = service.buildEstimateForm(leak);
    const result = service.getEstimateDataFromForm(form);

    expect(result.leakRateEstimate).toBe(0.75);
  });

  it('buildOrificeForm → getOrificeDataFromForm round-trips all fields', () => {
    const leak = service.getEmptyAirLeakData();
    leak.orificeMethodData = {
      compressorAirTemp: 70, atmosphericPressure: 14.7, dischargeCoefficient: 0.61,
      orificeDiameter: 0.5, supplyPressure: 100, numberOfOrifices: 2,
    };

    const form = service.buildOrificeForm(leak);
    const result = service.getOrificeDataFromForm(form);

    expect(result.orificeDiameter).toBe(0.5);
    expect(result.compressorAirTemp).toBe(70);
    expect(result.numberOfOrifices).toBe(2);
  });

  it('buildDecibelForm → getDecibelDataFromForm round-trips all fields', () => {
    const leak = service.getEmptyAirLeakData();
    leak.decibelsMethodData = {
      linePressure: 130, decibels: 80, decibelRatingA: 1, pressureA: 1,
      firstFlowA: 1, secondFlowA: 1, decibelRatingB: 1, pressureB: 1,
      firstFlowB: 1, secondFlowB: 1,
    };

    const form = service.buildDecibelForm(leak);
    const result = service.getDecibelDataFromForm(form);

    expect(result.linePressure).toBe(130);
    expect(result.decibels).toBe(80);
  });

  it('buildBagForm → getBagDataFromForm round-trips volume and fillTime', () => {
    const leak = service.getEmptyAirLeakData();
    leak.bagMethodData = { operatingTime: 8760, bagVolume: 2.5, bagFillTime: 45 };

    const form = service.buildBagForm(leak);
    const result = service.getBagDataFromForm(form, 8760);

    expect(result.bagVolume).toBe(2.5);
    expect(result.bagFillTime).toBe(45);
    expect(result.operatingTime).toBe(8760);
  });

  // ─── buildFacilityCompressorForm / applyCompressorValidators ─────────────────

  it('buildFacilityCompressorForm marks compressorControl invalid when null and utilityType is electric', () => {
    const form = service.buildFacilityCompressorForm({
      hoursPerYear: 8760,
      utilityType: 1,
      utilityCost: 0.066,
      compressorElectricityData: {
        compressorControl: null as any,
        compressorControlAdjustment: 25,
        compressorSpecificPowerControl: 0,
        compressorSpecificPower: 16
      }
    });

    expect(form.get('compressorElectricityData.compressorControl').valid).toBeFalse();
    expect(form.valid).toBeFalse();
  });

  it('buildFacilityCompressorForm marks compressorControlAdjustment invalid when compressorControl is custom (8)', () => {
    const form = service.buildFacilityCompressorForm({
      hoursPerYear: 8760,
      utilityType: 1,
      utilityCost: 0.066,
      compressorElectricityData: {
        compressorControl: 8,
        compressorControlAdjustment: null as any,
        compressorSpecificPowerControl: 0,
        compressorSpecificPower: 16
      }
    });

    expect(form.get('compressorElectricityData.compressorControlAdjustment').valid).toBeFalse();
    expect(form.valid).toBeFalse();
  });

  it('buildFacilityCompressorForm does not require electric fields when utilityType is compressed air (0)', () => {
    const form = service.buildFacilityCompressorForm({
      hoursPerYear: 8760,
      utilityType: 0,
      utilityCost: 0.066,
      compressorElectricityData: {
        compressorControl: null as any,
        compressorControlAdjustment: null as any,
        compressorSpecificPowerControl: 0,
        compressorSpecificPower: 16
      }
    });

    expect(form.get('compressorElectricityData.compressorControl').valid).toBeTrue();
    expect(form.get('compressorElectricityData.compressorControlAdjustment').valid).toBeTrue();
  });

  it('buildFacilityCompressorForm is valid for a complete electric configuration', () => {
    const form = service.buildFacilityCompressorForm(service.getExampleFacilityCompressorData());

    expect(form.valid).toBeTrue();
  });
});
