import { TestBed } from '@angular/core/testing';

import { PsatReportRollupService } from './psat-report-rollup.service';

describe('PsatReportRollupService', () => {
  let service: PsatReportRollupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PsatReportRollupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
