import { TestBed, inject } from '@angular/core/testing';

import { GasLeakageCompareService } from './gas-leakage-compare.service';

describe('GasLeakageCompareService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GasLeakageCompareService]
    });
  });

  it('should be created', inject([GasLeakageCompareService], (service: GasLeakageCompareService) => {
    expect(service).toBeTruthy();
  }));
});
