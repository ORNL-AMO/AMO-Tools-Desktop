import { TestBed } from '@angular/core/testing';
import { GasLeakageFormService } from './gas-leakage-form.service';

describe('GasLeakageFormService', () => {
  let service: GasLeakageFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [GasLeakageFormService] });
    service = TestBed.inject(GasLeakageFormService);
  });

  it('defaults coefficient, specific gravity, and correction factor on an empty loss', () => {
    const values = service.getGasLeakageForm().getRawValue();

    expect(values).toEqual(jasmine.objectContaining({ coefficient: 0.8052, specificGravity: 1, correctionFactor: 1, draftPressure: null }));
  });

  it('is invalid until the required inputs are provided', () => {
    expect(service.getGasLeakageForm().valid).toBeFalse();
  });

  it('rejects a negative opening area and specific gravity', () => {
    const form = service.getGasLeakageForm({ draftPressure: 0.1, leakageGasTemperature: 1500, ambientTemperature: 70, openingArea: -1, specificGravity: -1 });

    expect(form.controls.openingArea.errors?.['min']).toBeTruthy();
    expect(form.controls.specificGravity.errors?.['min']).toBeTruthy();
  });

  it('rejects a negative furnace draft pressure', () => {
    const form = service.getGasLeakageForm({ draftPressure: -0.1, leakageGasTemperature: 1500, ambientTemperature: 70, openingArea: 1 });

    expect(form.controls.draftPressure.errors?.['min']).toBeTruthy();
  });

  it('round-trips a loss through the form', () => {
    const loss = { draftPressure: 0.1, openingArea: 2, leakageGasTemperature: 1500, ambientTemperature: 70, coefficient: 0.9, specificGravity: 1.2, correctionFactor: 0.8 };

    expect(service.buildGasLeakageLoss(service.getGasLeakageForm(loss))).toEqual(loss);
  });
});
