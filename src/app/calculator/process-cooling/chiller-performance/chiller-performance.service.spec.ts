import { TestBed } from '@angular/core/testing';

import { ChillerPerformanceService } from './chiller-performance.service';

describe('ChillerPerformanceService', () => {
  let service: ChillerPerformanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChillerPerformanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
