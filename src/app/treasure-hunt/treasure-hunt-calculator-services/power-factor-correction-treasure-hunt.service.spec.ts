import { TestBed } from '@angular/core/testing';

import { PowerFactorCorrectionTreasureHuntService } from './power-factor-correction-treasure-hunt.service';

describe('PowerFactorCorrectionTreasureHuntService', () => {
  let service: PowerFactorCorrectionTreasureHuntService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PowerFactorCorrectionTreasureHuntService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
