import { TestBed } from '@angular/core/testing';

import { PerformancePointCalculationsService } from './performance-point-calculations.service';

describe('PerformancePointCalculationsService', () => {
  let service: PerformancePointCalculationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PerformancePointCalculationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
