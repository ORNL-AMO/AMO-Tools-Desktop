import { TestBed } from '@angular/core/testing';

import { WaterAssessmentResultsService } from './water-assessment-results.service';

describe('WaterAssessmentResultsService', () => {
  let service: WaterAssessmentResultsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WaterAssessmentResultsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
