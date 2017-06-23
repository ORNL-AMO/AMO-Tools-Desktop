import { TestBed, inject } from '@angular/core/testing';

import { WallLossCompareService } from './wall-loss-compare.service';

describe('WallLossCompareService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WallLossCompareService]
    });
  });

  it('should be created', inject([WallLossCompareService], (service: WallLossCompareService) => {
    expect(service).toBeTruthy();
  }));
});
