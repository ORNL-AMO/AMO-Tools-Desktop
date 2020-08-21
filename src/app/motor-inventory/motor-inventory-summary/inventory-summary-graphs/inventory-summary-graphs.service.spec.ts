import { TestBed } from '@angular/core/testing';

import { InventorySummaryGraphsService } from './inventory-summary-graphs.service';

describe('InventorySummaryGraphsService', () => {
  let service: InventorySummaryGraphsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventorySummaryGraphsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
