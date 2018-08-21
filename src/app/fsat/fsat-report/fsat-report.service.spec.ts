import { TestBed, inject } from '@angular/core/testing';

import { FsatReportService } from './fsat-report.service';

describe('FsatReportService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FsatReportService]
    });
  });

  it('should be created', inject([FsatReportService], (service: FsatReportService) => {
    expect(service).toBeTruthy();
  }));
});
