import { TestBed, inject } from '@angular/core/testing';

import { CompressedAirReductionService } from './compressed-air-reduction.service';

describe('CompressedAirReductionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CompressedAirReductionService]
    });
  });

  it('should be created', inject([CompressedAirReductionService], (service: CompressedAirReductionService) => {
    expect(service).toBeTruthy();
  }));
});
