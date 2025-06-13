import { TestBed } from '@angular/core/testing';

import { CompressedAirInventorySummaryTableService } from './compressed-air-inventory-summary-table.service';

describe('CompressedAirInventorySummaryTableService', () => {
  let service: CompressedAirInventorySummaryTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompressedAirInventorySummaryTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
