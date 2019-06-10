import { TestBed, inject } from '@angular/core/testing';

import { NaturalGasReductionService } from './natural-gas-reduction.service';

describe('NaturalGasReductionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NaturalGasReductionService]
    });
  });

  it('should be created', inject([NaturalGasReductionService], (service: NaturalGasReductionService) => {
    expect(service).toBeTruthy();
  }));
});
