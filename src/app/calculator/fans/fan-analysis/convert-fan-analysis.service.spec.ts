import { TestBed } from '@angular/core/testing';

import { ConvertFanAnalysisService } from './convert-fan-analysis.service';

describe('ConvertFanAnalysisService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ConvertFanAnalysisService = TestBed.get(ConvertFanAnalysisService);
    expect(service).toBeTruthy();
  });
});
