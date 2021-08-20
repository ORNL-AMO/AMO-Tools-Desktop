import { TestBed } from '@angular/core/testing';

import { CompressedAirAssessmentResultsService } from './compressed-air-assessment-results.service';

describe('CompressedAirAssessmentResultsService', () => {
  let service: CompressedAirAssessmentResultsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompressedAirAssessmentResultsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
