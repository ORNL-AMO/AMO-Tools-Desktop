import { TestBed, inject } from '@angular/core/testing';

import { PowerFactorCorrectionService } from './power-factor-correction.service';

describe('PowerFactorCorrectionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PowerFactorCorrectionService]
    });
  });

  it('should be created', inject([PowerFactorCorrectionService], (service: PowerFactorCorrectionService) => {
    expect(service).toBeTruthy();
  }));
});
