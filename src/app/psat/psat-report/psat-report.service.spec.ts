import { TestBed, inject } from '@angular/core/testing';

import { PsatReportService } from './psat-report.service';

describe('PsatReportService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PsatReportService]
    });
  });

  it('should be created', inject([PsatReportService], (service: PsatReportService) => {
    expect(service).toBeTruthy();
  }));
});
