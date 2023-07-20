import { TestBed } from '@angular/core/testing';

import { PumpInventorySummaryService } from './pump-inventory-summary.service';

describe('PumpInventorySummaryService', () => {
  let service: PumpInventorySummaryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PumpInventorySummaryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
