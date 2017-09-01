import { TestBed, inject } from '@angular/core/testing';

import { EnergyInputCompareService } from './energy-input-compare.service';

describe('EnergyInputCompareService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EnergyInputCompareService]
    });
  });

  it('should be created', inject([EnergyInputCompareService], (service: EnergyInputCompareService) => {
    expect(service).toBeTruthy();
  }));
});
