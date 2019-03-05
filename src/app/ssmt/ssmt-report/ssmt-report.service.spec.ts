import { TestBed, inject } from '@angular/core/testing';

import { SsmtReportService } from './ssmt-report.service';

describe('SsmtReportService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SsmtReportService]
    });
  });

  it('should be created', inject([SsmtReportService], (service: SsmtReportService) => {
    expect(service).toBeTruthy();
  }));
});
