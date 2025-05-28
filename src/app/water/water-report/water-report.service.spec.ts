import { TestBed } from '@angular/core/testing';

import { WaterReportService } from './water-report.service';

describe('WaterReportService', () => {
  let service: WaterReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WaterReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
