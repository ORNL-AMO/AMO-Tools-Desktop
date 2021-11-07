import { TestBed } from '@angular/core/testing';

import { PerformancePointsFormService } from './performance-points-form.service';

describe('PerformancePointsFormService', () => {
  let service: PerformancePointsFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PerformancePointsFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
