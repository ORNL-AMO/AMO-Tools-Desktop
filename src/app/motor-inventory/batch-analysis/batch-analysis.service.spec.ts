import { TestBed } from '@angular/core/testing';

import { BatchAnalysisService } from './batch-analysis.service';

describe('BatchAnalysisService', () => {
  let service: BatchAnalysisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BatchAnalysisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
