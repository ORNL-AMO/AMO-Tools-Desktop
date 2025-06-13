import { TestBed } from '@angular/core/testing';

import { CompressedAirInventorySummaryOverviewService } from './compressed-air-inventory-summary-overview.service';

describe('CompressedAirInventorySummaryOverviewService', () => {
  let service: CompressedAirInventorySummaryOverviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompressedAirInventorySummaryOverviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
