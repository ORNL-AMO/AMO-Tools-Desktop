import { TestBed } from '@angular/core/testing';

import { CoolingTowerMakeupTreasureHuntService } from './cooling-tower-makeup-treasure-hunt.service';

describe('CoolingTowerMakeupTreasureHuntService', () => {
  let service: CoolingTowerMakeupTreasureHuntService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoolingTowerMakeupTreasureHuntService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
