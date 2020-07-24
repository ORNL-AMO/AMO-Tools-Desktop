import { TestBed } from '@angular/core/testing';

import { BatchAnalysisDataService } from './batch-analysis-data.service';

describe('BatchAnalysisDataService', () => {
  let service: BatchAnalysisDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BatchAnalysisDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
