import { TestBed, inject } from '@angular/core/testing';

import { ExhaustGasCompareService } from './exhaust-gas-compare.service';

describe('ExhaustGasCompareService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExhaustGasCompareService]
    });
  });

  it('should be created', inject([ExhaustGasCompareService], (service: ExhaustGasCompareService) => {
    expect(service).toBeTruthy();
  }));
});
