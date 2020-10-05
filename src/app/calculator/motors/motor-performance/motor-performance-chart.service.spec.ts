import { TestBed } from '@angular/core/testing';

import { MotorPerformanceChartService } from './motor-performance-chart.service';

describe('MotorPerformanceChartService', () => {
  let service: MotorPerformanceChartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MotorPerformanceChartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
