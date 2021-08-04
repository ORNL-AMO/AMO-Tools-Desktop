import { TestBed } from '@angular/core/testing';

import { SteamReductionTreasureHuntService } from './steam-reduction-treasure-hunt.service';

describe('SteamReductionTreasureHuntService', () => {
  let service: SteamReductionTreasureHuntService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SteamReductionTreasureHuntService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
