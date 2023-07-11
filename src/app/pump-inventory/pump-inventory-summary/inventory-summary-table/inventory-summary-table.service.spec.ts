import { TestBed } from '@angular/core/testing';

import { InventorySummaryTableService } from './inventory-summary-table.service';

describe('InventorySummaryTableService', () => {
  let service: InventorySummaryTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventorySummaryTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
