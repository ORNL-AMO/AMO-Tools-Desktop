import { TestBed, inject } from '@angular/core/testing';

import { PhastReportService } from './phast-report.service';

describe('PhastReportService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PhastReportService]
    });
  });

  it('should be created', inject([PhastReportService], (service: PhastReportService) => {
    expect(service).toBeTruthy();
  }));
});
