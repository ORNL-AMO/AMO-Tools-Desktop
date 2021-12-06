import { TestBed } from '@angular/core/testing';

import { CompressedAirCalculationService } from './compressed-air-calculation.service';

describe('CompressedAirCalculationService', () => {
  let service: CompressedAirCalculationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompressedAirCalculationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
