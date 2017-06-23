import { TestBed, inject } from '@angular/core/testing';

import { FixtureLossesCompareService } from './fixture-losses-compare.service';

describe('FixtureLossesCompareService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FixtureLossesCompareService]
    });
  });

  it('should be created', inject([FixtureLossesCompareService], (service: FixtureLossesCompareService) => {
    expect(service).toBeTruthy();
  }));
});
