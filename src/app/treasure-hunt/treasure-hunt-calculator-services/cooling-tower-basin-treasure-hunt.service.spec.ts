import { TestBed } from '@angular/core/testing';

import { CoolingTowerBasinTreasureHuntService } from './cooling-tower-basin-treasure-hunt.service';

describe('CoolingTowerBasinTreasureHuntService', () => {
  let service: CoolingTowerBasinTreasureHuntService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoolingTowerBasinTreasureHuntService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
