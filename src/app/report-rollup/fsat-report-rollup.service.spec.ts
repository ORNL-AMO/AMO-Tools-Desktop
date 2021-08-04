import { TestBed } from '@angular/core/testing';

import { FsatReportRollupService } from './fsat-report-rollup.service';

describe('FsatReportRollupService', () => {
  let service: FsatReportRollupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FsatReportRollupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
