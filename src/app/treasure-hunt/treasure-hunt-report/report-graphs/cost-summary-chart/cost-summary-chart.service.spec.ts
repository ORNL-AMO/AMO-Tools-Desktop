import { TestBed, inject } from '@angular/core/testing';

import { CostSummaryChartService } from './cost-summary-chart.service';

describe('CostSummaryChartService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CostSummaryChartService]
    });
  });

  it('should be created', inject([CostSummaryChartService], (service: CostSummaryChartService) => {
    expect(service).toBeTruthy();
  }));
});
