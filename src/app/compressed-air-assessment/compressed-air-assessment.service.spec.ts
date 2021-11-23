import { TestBed } from '@angular/core/testing';

import { CompressedAirAssessmentService } from './compressed-air-assessment.service';

describe('CompressedAirAssessmentService', () => {
  let service: CompressedAirAssessmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompressedAirAssessmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
