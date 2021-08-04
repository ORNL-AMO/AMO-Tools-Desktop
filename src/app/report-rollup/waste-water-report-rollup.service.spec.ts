import { TestBed } from '@angular/core/testing';

import { WasteWaterReportRollupService } from './waste-water-report-rollup.service';

describe('WasteWaterReportRollupService', () => {
  let service: WasteWaterReportRollupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WasteWaterReportRollupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
