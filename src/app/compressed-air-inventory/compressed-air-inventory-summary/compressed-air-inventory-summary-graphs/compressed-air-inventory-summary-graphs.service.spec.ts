import { TestBed } from '@angular/core/testing';

import { CompressedAirInventorySummaryGraphsService } from './compressed-air-inventory-summary-graphs.service';

describe('CompressedAirInventorySummaryGraphsService', () => {
  let service: CompressedAirInventorySummaryGraphsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompressedAirInventorySummaryGraphsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
