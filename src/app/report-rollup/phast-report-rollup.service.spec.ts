import { TestBed } from '@angular/core/testing';

import { PhastReportRollupService } from './phast-report-rollup.service';

describe('PhastReportRollupService', () => {
  let service: PhastReportRollupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhastReportRollupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
