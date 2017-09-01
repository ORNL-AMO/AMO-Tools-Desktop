import { TestBed, inject } from '@angular/core/testing';

import { MeteredEnergyService } from './metered-energy.service';

describe('MeteredEnergyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MeteredEnergyService]
    });
  });

  it('should be created', inject([MeteredEnergyService], (service: MeteredEnergyService) => {
    expect(service).toBeTruthy();
  }));
});
