import { TestBed } from '@angular/core/testing';

import { ChillerPerformanceFormService } from './chiller-performance-form.service';

describe('ChillerPerformanceFormService', () => {
  let service: ChillerPerformanceFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChillerPerformanceFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
