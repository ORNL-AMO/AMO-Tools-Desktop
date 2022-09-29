import { TestBed } from '@angular/core/testing';

import { CoolingTowerFanTreasureHuntService } from './cooling-tower-fan-treasure-hunt.service';

describe('CoolingTowerFanTreasureHuntService', () => {
  let service: CoolingTowerFanTreasureHuntService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoolingTowerFanTreasureHuntService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
