import { TestBed } from '@angular/core/testing';

import { InventorySummaryOverviewService } from './inventory-summary-overview.service';

describe('InventorySummaryOverviewService', () => {
  let service: InventorySummaryOverviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventorySummaryOverviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
