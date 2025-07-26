import { TestBed } from '@angular/core/testing';

import { ProcessCoolingAssessmentService } from './process-cooling-assessment.service';

describe('ProcessCoolingAssessmentService', () => {
  let service: ProcessCoolingAssessmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProcessCoolingAssessmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
