import { TestBed } from '@angular/core/testing';

import { OperatingCostService } from './operating-cost.service';

describe('OperatingCostService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OperatingCostService = TestBed.get(OperatingCostService);
    expect(service).toBeTruthy();
  });
});
