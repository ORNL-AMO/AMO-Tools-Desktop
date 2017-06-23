import { TestBed, inject } from '@angular/core/testing';

import { ChargeMaterialCompareService } from './charge-material-compare.service';

describe('ChargeMaterialCompareService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChargeMaterialCompareService]
    });
  });

  it('should be created', inject([ChargeMaterialCompareService], (service: ChargeMaterialCompareService) => {
    expect(service).toBeTruthy();
  }));
});
