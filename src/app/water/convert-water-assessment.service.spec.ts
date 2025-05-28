import { TestBed } from '@angular/core/testing';

import { ConvertWaterAssessmentService } from './convert-water-assessment.service';

describe('ConvertWaterAssessmentService', () => {
  let service: ConvertWaterAssessmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConvertWaterAssessmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
