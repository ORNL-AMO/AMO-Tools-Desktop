import { TestBed, inject } from '@angular/core/testing';

import { TreasureHuntReportService } from './treasure-hunt-report.service';

describe('TreasureHuntReportService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TreasureHuntReportService]
    });
  });

  it('should be created', inject([TreasureHuntReportService], (service: TreasureHuntReportService) => {
    expect(service).toBeTruthy();
  }));
});
