import { TestBed } from '@angular/core/testing';

import { ReportSummaryGraphsService } from './report-summary-graphs.service';

describe('ReportSummaryGraphsService', () => {
  let service: ReportSummaryGraphsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportSummaryGraphsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
