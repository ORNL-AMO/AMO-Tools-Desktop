import { TestBed } from '@angular/core/testing';

import { PumpSummaryGraphsService } from './pump-summary-graphs.service';

describe('PumpSummaryGraphsService', () => {
  let service: PumpSummaryGraphsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PumpSummaryGraphsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
