import { TestBed } from '@angular/core/testing';

import { PerformancePointsCalculationsService } from './performance-points-calculations.service';

describe('PerformancePointsCalculationsService', () => {
  let service: PerformancePointsCalculationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PerformancePointsCalculationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
