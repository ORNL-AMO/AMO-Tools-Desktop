import { TestBed } from '@angular/core/testing';

import { LeakageTreasureHuntService } from './leakage-treasure-hunt.service';

describe('LeakageTreasureHuntService', () => {
  let service: LeakageTreasureHuntService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LeakageTreasureHuntService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
