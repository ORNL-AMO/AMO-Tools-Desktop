import { TestBed, inject } from '@angular/core/testing';

import { ExecutiveSummaryService } from './executive-summary.service';

describe('ExecutiveSummaryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExecutiveSummaryService]
    });
  });

  it('should be created', inject([ExecutiveSummaryService], (service: ExecutiveSummaryService) => {
    expect(service).toBeTruthy();
  }));
});
