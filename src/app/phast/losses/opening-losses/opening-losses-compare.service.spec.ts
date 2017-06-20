import { TestBed, inject } from '@angular/core/testing';

import { OpeningLossesCompareService } from './opening-losses-compare.service';

describe('OpeningLossesCompareService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OpeningLossesCompareService]
    });
  });

  it('should be created', inject([OpeningLossesCompareService], (service: OpeningLossesCompareService) => {
    expect(service).toBeTruthy();
  }));
});
