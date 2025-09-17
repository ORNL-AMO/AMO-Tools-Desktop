import { TestBed } from '@angular/core/testing';

import { ValveEnergyLossService } from './valve-energy-loss.service';

describe('ValveEnergyLossService', () => {
  let service: ValveEnergyLossService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValveEnergyLossService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
