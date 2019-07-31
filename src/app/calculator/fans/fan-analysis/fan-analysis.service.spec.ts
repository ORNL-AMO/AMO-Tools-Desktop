import { TestBed } from '@angular/core/testing';

import { FanAnalysisService } from './fan-analysis.service';

describe('FanAnalysisService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FanAnalysisService = TestBed.get(FanAnalysisService);
    expect(service).toBeTruthy();
  });
});
