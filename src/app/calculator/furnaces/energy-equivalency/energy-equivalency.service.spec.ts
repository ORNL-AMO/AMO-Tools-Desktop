import { TestBed, inject } from '@angular/core/testing';

import { EnergyEquivalencyService } from './energy-equivalency.service';

describe('EnergyEquivalencyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EnergyEquivalencyService]
    });
  });

  it('should be created', inject([EnergyEquivalencyService], (service: EnergyEquivalencyService) => {
    expect(service).toBeTruthy();
  }));
});
