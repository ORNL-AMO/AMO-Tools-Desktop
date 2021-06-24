import { TestBed } from '@angular/core/testing';

import { EnergyFormService } from './energy-form.service';

describe('EnergyFormService', () => {
  let service: EnergyFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnergyFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
