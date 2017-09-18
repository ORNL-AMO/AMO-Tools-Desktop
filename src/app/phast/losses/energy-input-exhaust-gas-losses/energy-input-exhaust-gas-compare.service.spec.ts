import { TestBed, inject } from '@angular/core/testing';

import { EnergyInputExhaustGasCompareService } from './energy-input-exhaust-gas-compare.service';

describe('EnergyInputExhaustGasCompareService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EnergyInputExhaustGasCompareService]
    });
  });

  it('should be created', inject([EnergyInputExhaustGasCompareService], (service: EnergyInputExhaustGasCompareService) => {
    expect(service).toBeTruthy();
  }));
});
