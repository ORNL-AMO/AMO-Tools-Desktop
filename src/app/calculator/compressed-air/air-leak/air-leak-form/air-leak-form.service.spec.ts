import { FormBuilder } from '@angular/forms';
import { LeakMeasurementMethod } from '../../compressed-air-constants';
import { AirLeakFormService } from './air-leak-form.service';
import { AirLeakSurveyData, AirLeakSurveyInput } from '../../../../shared/models/standalone';
import { Settings } from '../../../../shared/models/settings';

describe('AirLeakFormService', () => {
  let service: AirLeakFormService;

  beforeEach(() => {
    service = new AirLeakFormService(new FormBuilder(), {} as any);
  });

  it('checkValidInput returns false when any leak row is invalid', () => {
    const invalidLeak = service.getEmptyAirLeakData();
    invalidLeak.name = '';
    invalidLeak.leakDescription = 'Leak description';
    invalidLeak.measurementMethod = LeakMeasurementMethod.Estimate;
    invalidLeak.estimateMethodData.leakRateEstimate = 5;

    const input: AirLeakSurveyInput = {
      compressedAirLeakSurveyInputVec: [invalidLeak],
      facilityCompressorData: service.getExampleFacilityCompressorData()
    };

    expect(service.checkValidInput(input)).toBeFalse();
  });

  // ─── P5 — form service ────────────────────────────────────────────────────────

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

  it('checkValidInput returns true for a fully valid input', () => {
    const leak = service.getEmptyAirLeakData();
    leak.name = 'Valid Leak';
    leak.leakDescription = 'Some description';
    leak.estimateMethodData.leakRateEstimate = 0.5;

    const input: AirLeakSurveyInput = {
      compressedAirLeakSurveyInputVec: [leak],
      facilityCompressorData: service.getExampleFacilityCompressorData()
    };

    expect(service.checkValidInput(input)).toBeTrue();
  });

  it('getLeakFormFromObj → getAirLeakObjFromForm round-trips all fields correctly', () => {
    const original: AirLeakSurveyData = service.getEmptyAirLeakData();
    original.name = 'Round-trip Leak';
    original.leakDescription = 'RT description';
    original.measurementMethod = LeakMeasurementMethod.Estimate;
    original.estimateMethodData.leakRateEstimate = 0.75;
    original.orificeMethodData.orificeDiameter = 0.5;
    original.decibelsMethodData.linePressure = 130;

    const form = service.getLeakFormFromObj(original);
    const result = service.getAirLeakObjFromForm(form);

    expect(result.name).toBe('Round-trip Leak');
    expect(result.leakDescription).toBe('RT description');
    expect(result.measurementMethod).toBe(LeakMeasurementMethod.Estimate);
    expect(result.estimateMethodData.leakRateEstimate).toBe(0.75);
    expect(result.orificeMethodData.orificeDiameter).toBe(0.5);
    expect(result.decibelsMethodData.linePressure).toBe(130);
    expect(result.bagMethodData).toEqual(original.bagMethodData);
  });

  it('setCompressorDataValidators marks compressorControl invalid after updateValueAndValidity when utilityType is electric', () => {
    // compressorControl is null — with utilityType=1, Validators.required must be applied
    // and updateValueAndValidity() must be called for the form to reflect the new state.
    // This test verifies the P1 #3 fix is in place.
    const form = service.getFacilityCompressorFormFromObj({
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

  it('setCompressorDataValidators marks compressorControlAdjustment invalid when compressorControl is custom (8)', () => {
    const form = service.getFacilityCompressorFormFromObj({
      hoursPerYear: 8760,
      utilityType: 1,
      utilityCost: 0.066,
      compressorElectricityData: {
        compressorControl: 8,
        compressorControlAdjustment: null as any, // required when control is custom
        compressorSpecificPowerControl: 0,
        compressorSpecificPower: 16
      }
    });

    expect(form.get('compressorElectricityData.compressorControlAdjustment').valid).toBeFalse();
    expect(form.valid).toBeFalse();
  });

  it('setCompressorDataValidators does not add required validators when utilityType is compressed air (0)', () => {
    const form = service.getFacilityCompressorFormFromObj({
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

    // no validators added for electric-only fields when utilityType is 0
    expect(form.get('compressorElectricityData.compressorControl').valid).toBeTrue();
    expect(form.get('compressorElectricityData.compressorControlAdjustment').valid).toBeTrue();
  });
});
