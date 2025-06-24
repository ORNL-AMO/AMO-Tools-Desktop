import { TestBed } from '@angular/core/testing';

import { ProcessCoolingReportService } from './process-cooling-report.service';

describe('ProcessCoolingReportService', () => {
  let service: ProcessCoolingReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProcessCoolingReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
