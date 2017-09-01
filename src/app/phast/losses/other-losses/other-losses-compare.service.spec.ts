import { TestBed, inject } from '@angular/core/testing';

import { OtherLossesCompareService } from './other-losses-compare.service';

describe('OtherLossesCompareService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OtherLossesCompareService]
    });
  });

  it('should be created', inject([OtherLossesCompareService], (service: OtherLossesCompareService) => {
    expect(service).toBeTruthy();
  }));
});
