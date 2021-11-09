import { TestBed } from '@angular/core/testing';

import { ReduceSystemAirPressureService } from './reduce-system-air-pressure.service';

describe('ReduceSystemAirPressureService', () => {
  let service: ReduceSystemAirPressureService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReduceSystemAirPressureService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
