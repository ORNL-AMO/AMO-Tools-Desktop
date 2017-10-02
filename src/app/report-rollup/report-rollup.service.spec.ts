import { TestBed, inject } from '@angular/core/testing';

import { ReportRollupService } from './report-rollup.service';

describe('ReportRollupService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReportRollupService]
    });
  });

  it('should be created', inject([ReportRollupService], (service: ReportRollupService) => {
    expect(service).toBeTruthy();
  }));
});
