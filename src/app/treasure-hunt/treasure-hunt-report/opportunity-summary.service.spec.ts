import { TestBed, inject } from '@angular/core/testing';

import { OpportunitySummaryService } from './opportunity-summary.service';

describe('OpportunitySummaryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OpportunitySummaryService]
    });
  });

  it('should be created', inject([OpportunitySummaryService], (service: OpportunitySummaryService) => {
    expect(service).toBeTruthy();
  }));
});
