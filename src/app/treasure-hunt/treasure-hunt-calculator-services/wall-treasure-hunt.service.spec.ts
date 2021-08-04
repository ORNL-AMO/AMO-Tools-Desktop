import { TestBed } from '@angular/core/testing';

import { WallTreasureHuntService } from './wall-treasure-hunt.service';

describe('WallTreasureHuntService', () => {
  let service: WallTreasureHuntService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WallTreasureHuntService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
