import { TestBed } from '@angular/core/testing';

import { CompressedAirPressureReductionService } from './compressed-air-pressure-reduction.service';

describe('CompressedAirPressureReductionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CompressedAirPressureReductionService = TestBed.get(CompressedAirPressureReductionService);
    expect(service).toBeTruthy();
  });
});
