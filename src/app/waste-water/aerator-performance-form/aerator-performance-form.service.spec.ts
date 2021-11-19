import { TestBed } from '@angular/core/testing';

import { AeratorPerformanceFormService } from './aerator-performance-form.service';

describe('AeratorPerformanceFormService', () => {
  let service: AeratorPerformanceFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AeratorPerformanceFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
