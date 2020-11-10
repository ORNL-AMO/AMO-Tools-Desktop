import { TestBed } from '@angular/core/testing';

import { TreasureHuntReportRollupService } from './treasure-hunt-report-rollup.service';

describe('TreasureHuntReportRollupService', () => {
  let service: TreasureHuntReportRollupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TreasureHuntReportRollupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
