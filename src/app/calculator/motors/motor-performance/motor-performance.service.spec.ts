import { TestBed, inject } from '@angular/core/testing';

import { MotorPerformanceService } from './motor-performance.service';

describe('MotorPerformanceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MotorPerformanceService]
    });
  });

  it('should be created', inject([MotorPerformanceService], (service: MotorPerformanceService) => {
    expect(service).toBeTruthy();
  }));
});
