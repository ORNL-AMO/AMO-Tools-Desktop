import { TestBed } from '@angular/core/testing';

import { SsmtReportRollupService } from './ssmt-report-rollup.service';

describe('SsmtReportRollupService', () => {
  let service: SsmtReportRollupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SsmtReportRollupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
