import { TestBed, inject } from '@angular/core/testing';

import { AuxiliaryPowerCompareService } from './auxiliary-power-compare.service';

describe('AuxiliaryPowerCompareService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuxiliaryPowerCompareService]
    });
  });

  it('should be created', inject([AuxiliaryPowerCompareService], (service: AuxiliaryPowerCompareService) => {
    expect(service).toBeTruthy();
  }));
});
