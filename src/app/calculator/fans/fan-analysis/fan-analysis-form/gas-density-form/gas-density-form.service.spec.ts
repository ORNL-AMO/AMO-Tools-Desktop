import { TestBed } from '@angular/core/testing';

import { GasDensityFormService } from './gas-density-form.service';

describe('GasDensityFormService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GasDensityFormService = TestBed.get(GasDensityFormService);
    expect(service).toBeTruthy();
  });
});
