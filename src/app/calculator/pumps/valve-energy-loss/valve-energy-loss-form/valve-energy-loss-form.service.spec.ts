import { TestBed } from '@angular/core/testing';

import { ValveEnergyLossFormService } from './valve-energy-loss-form.service';

describe('ValveEnergyLossFormService', () => {
  let service: ValveEnergyLossFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValveEnergyLossFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
