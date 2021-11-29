import { TestBed } from '@angular/core/testing';

import { StatePointAnalysisGraphService } from './state-point-analysis-graph.service';

describe('StatePointAnalysisGraphService', () => {
  let service: StatePointAnalysisGraphService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatePointAnalysisGraphService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
