import { TestBed } from '@angular/core/testing';

import { WaterHeatingTreasureHuntService } from './water-heating-treasure-hunt.service';

describe('WaterHeatingTreasureHuntService', () => {
  let service: WaterHeatingTreasureHuntService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WaterHeatingTreasureHuntService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
