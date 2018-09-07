import { TestBed, inject } from '@angular/core/testing';

import { LineChartHelperService } from './line-chart-helper.service';

describe('LineChartHelperService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LineChartHelperService]
    });
  });

  it('should be created', inject([LineChartHelperService], (service: LineChartHelperService) => {
    expect(service).toBeTruthy();
  }));
});
