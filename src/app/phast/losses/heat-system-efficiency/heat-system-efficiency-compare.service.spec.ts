import { TestBed, inject } from '@angular/core/testing';

import { HeatSystemEfficiencyCompareService } from './heat-system-efficiency-compare.service';

describe('HeatSystemEfficiencyCompareService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HeatSystemEfficiencyCompareService]
    });
  });

  it('should be created', inject([HeatSystemEfficiencyCompareService], (service: HeatSystemEfficiencyCompareService) => {
    expect(service).toBeTruthy();
  }));
});
