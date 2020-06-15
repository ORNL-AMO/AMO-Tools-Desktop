import { TestBed } from '@angular/core/testing';

import { DayTypeAnalysisService } from './day-type-analysis.service';

describe('DayTypeAnalysisService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DayTypeAnalysisService = TestBed.get(DayTypeAnalysisService);
    expect(service).toBeTruthy();
  });
});
