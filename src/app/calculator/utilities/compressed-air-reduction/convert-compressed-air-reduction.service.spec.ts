import { TestBed } from '@angular/core/testing';

import { ConvertCompressedAirReductionService } from './convert-compressed-air-reduction.service';

describe('ConvertCompressedAirReductionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ConvertCompressedAirReductionService = TestBed.get(ConvertCompressedAirReductionService);
    expect(service).toBeTruthy();
  });
});
