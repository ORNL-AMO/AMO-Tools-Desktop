import { TestBed } from '@angular/core/testing';

import { StatePointAnalysisService } from './state-point-analysis.service';

describe('StatePointAnalysisService', () => {
  let service: StatePointAnalysisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatePointAnalysisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
