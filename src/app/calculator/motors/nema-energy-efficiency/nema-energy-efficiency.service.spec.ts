import { TestBed, inject } from '@angular/core/testing';

import { NemaEnergyEfficiencyService } from './nema-energy-efficiency.service';

describe('NemaEnergyEfficiencyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NemaEnergyEfficiencyService]
    });
  });

  it('should be created', inject([NemaEnergyEfficiencyService], (service: NemaEnergyEfficiencyService) => {
    expect(service).toBeTruthy();
  }));
});
