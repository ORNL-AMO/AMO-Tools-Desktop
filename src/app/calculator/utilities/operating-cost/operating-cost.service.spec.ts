import { TestBed, inject } from '@angular/core/testing';

import { OperatingCostService } from './operating-cost.service';

describe('OperatingCostService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OperatingCostService]
    });
  });

  it('should be created', inject([OperatingCostService], (service: OperatingCostService) => {
    expect(service).toBeTruthy();
  }));
});
