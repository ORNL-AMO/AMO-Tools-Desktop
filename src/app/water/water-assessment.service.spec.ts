import { TestBed } from '@angular/core/testing';

import { WaterAssessmentService } from './water-assessment.service';

describe('WaterAssessmentService', () => {
  let service: WaterAssessmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WaterAssessmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
