import { TestBed } from '@angular/core/testing';

import { ProcessCoolingAsessmentService } from './process-cooling-assessment.service';

describe('ProcessCoolingAsessmentService', () => {
  let service: ProcessCoolingAsessmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProcessCoolingAsessmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
