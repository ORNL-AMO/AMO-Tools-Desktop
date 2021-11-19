import { TestBed } from '@angular/core/testing';

import { WaterReductionTreasureHuntService } from './water-reduction-treasure-hunt.service';

describe('WaterReductionTreasureHuntService', () => {
  let service: WaterReductionTreasureHuntService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WaterReductionTreasureHuntService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
