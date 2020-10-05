import { TestBed } from '@angular/core/testing';

import { MotorInventorySummaryService } from './motor-inventory-summary.service';

describe('MotorInventorySummaryService', () => {
  let service: MotorInventorySummaryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MotorInventorySummaryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
