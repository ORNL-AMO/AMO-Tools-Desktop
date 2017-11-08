import { TestBed, inject } from '@angular/core/testing';

import { PreAssessmentService } from './pre-assessment.service';

describe('PreAssessmentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PreAssessmentService]
    });
  });

  it('should be created', inject([PreAssessmentService], (service: PreAssessmentService) => {
    expect(service).toBeTruthy();
  }));
});
