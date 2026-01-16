import { TestBed } from '@angular/core/testing';

import { TrueCostReportService } from './true-cost-report.service';

describe('TrueCostReportService', () => {
  let service: TrueCostReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrueCostReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
