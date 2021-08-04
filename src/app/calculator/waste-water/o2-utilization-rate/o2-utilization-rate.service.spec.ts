import { TestBed } from '@angular/core/testing';

import { O2UtilizationRateService } from './o2-utilization-rate.service';

describe('O2UtilizationRateService', () => {
  let service: O2UtilizationRateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(O2UtilizationRateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
