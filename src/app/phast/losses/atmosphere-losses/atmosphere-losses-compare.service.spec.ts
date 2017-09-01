import { TestBed, inject } from '@angular/core/testing';

import { AtmosphereLossesCompareService } from './atmosphere-losses-compare.service';

describe('AtmosphereLossesCompareService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AtmosphereLossesCompareService]
    });
  });

  it('should be created', inject([AtmosphereLossesCompareService], (service: AtmosphereLossesCompareService) => {
    expect(service).toBeTruthy();
  }));
});
