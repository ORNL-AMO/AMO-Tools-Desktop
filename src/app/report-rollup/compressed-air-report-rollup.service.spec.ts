import { TestBed } from '@angular/core/testing';

import { CompressedAirReportRollupService } from './compressed-air-report-rollup.service';

describe('CompressedAirReportRollupService', () => {
  let service: CompressedAirReportRollupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompressedAirReportRollupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
