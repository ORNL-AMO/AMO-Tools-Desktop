import { TestBed } from '@angular/core/testing';
import { Slag } from '../../../../shared/models/phast/losses/slag';
import { SlagFormService } from './slag-form.service';

const LOSS: Slag = { weight: 100, inletTemperature: 80, outletTemperature: 2000, specificHeat: 0.2, correctionFactor: 1 };

describe('SlagFormService', () => {
  let service: SlagFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [SlagFormService] });
    service = TestBed.inject(SlagFormService);
  });

  it('is invalid on an empty loss and defaults correction factor to 1', () => {
    const form = service.getSlagForm();

    expect(form.valid).toBeFalse();
    expect(form.controls.correctionFactor.value).toBe(1);
  });

  it('is valid for a complete loss', () => {
    expect(service.getSlagForm(LOSS).valid).toBeTrue();
  });

  it('rejects negative weight and specific heat', () => {
    const form = service.getSlagForm({ ...LOSS, weight: -1, specificHeat: -1 });

    expect(form.controls.weight.errors?.['min']).toBeTruthy();
    expect(form.controls.specificHeat.errors?.['min']).toBeTruthy();
  });

  it('round-trips a loss through the form', () => {
    expect(service.buildSlag(service.getSlagForm(LOSS))).toEqual(LOSS);
  });
});
