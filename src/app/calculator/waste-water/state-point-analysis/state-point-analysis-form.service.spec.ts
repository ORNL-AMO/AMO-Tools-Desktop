import { TestBed } from '@angular/core/testing';

import { StatePointAnalysisFormService } from './state-point-analysis-form.service';

describe('StatePointAnalysisFormService', () => {
  let service: StatePointAnalysisFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatePointAnalysisFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
