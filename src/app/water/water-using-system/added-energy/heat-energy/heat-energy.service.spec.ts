import { TestBed } from '@angular/core/testing';

import { HeatEnergyService } from './heat-energy.service';

describe('HeatEnergyService', () => {
  let service: HeatEnergyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeatEnergyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
