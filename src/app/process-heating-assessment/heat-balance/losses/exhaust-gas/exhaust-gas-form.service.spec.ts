import { TestBed } from '@angular/core/testing';
import { ExhaustGasEAF } from '../../../../shared/models/phast/losses/exhaustGasEAF';
import { ExhaustGasFormService } from './exhaust-gas-form.service';

const LOSS: ExhaustGasEAF = { offGasTemp: 1500, CO: 10, H2: 5, combustibleGases: 2, vfr: 1000, dustLoading: 0.01, otherLosses: 0 };

describe('ExhaustGasFormService', () => {
  let service: ExhaustGasFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ExhaustGasFormService] });
    service = TestBed.inject(ExhaustGasFormService);
  });

  it('is invalid on an empty loss', () => {
    expect(service.getExhaustGasForm().valid).toBeFalse();
  });

  it('is valid for a complete loss', () => {
    expect(service.getExhaustGasForm(LOSS).valid).toBeTrue();
  });

  it('rejects percentages above 100', () => {
    const form = service.getExhaustGasForm({ ...LOSS, CO: 101, H2: 101, combustibleGases: 101 });

    expect(form.controls.CO.errors?.['max']).toBeTruthy();
    expect(form.controls.H2.errors?.['max']).toBeTruthy();
    expect(form.controls.combustibleGases.errors?.['max']).toBeTruthy();
  });

  it('rejects negative flow rate and dust loading', () => {
    const form = service.getExhaustGasForm({ ...LOSS, vfr: -1, dustLoading: -1 });

    expect(form.controls.vfr.errors?.['min']).toBeTruthy();
    expect(form.controls.dustLoading.errors?.['min']).toBeTruthy();
  });

  it('round-trips a loss through the form with otherLosses fixed at 0', () => {
    expect(service.buildExhaustGas(service.getExhaustGasForm(LOSS))).toEqual(LOSS);
  });
});
