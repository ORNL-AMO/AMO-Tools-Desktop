import { TestBed, inject } from '@angular/core/testing';

import { CoolingLossesCompareService } from './cooling-losses-compare.service';

describe('CoolingLossesCompareService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoolingLossesCompareService]
    });
  });

  it('should be created', inject([CoolingLossesCompareService], (service: CoolingLossesCompareService) => {
    expect(service).toBeTruthy();
  }));
});
