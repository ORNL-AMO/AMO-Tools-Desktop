import { TestBed } from '@angular/core/testing';

import { BoilerBlowdownRateTreasureHuntService } from './boiler-blowdown-rate-treasure-hunt.service';

describe('BoilerBlowdownRateTreasureHuntService', () => {
  let service: BoilerBlowdownRateTreasureHuntService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoilerBlowdownRateTreasureHuntService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
