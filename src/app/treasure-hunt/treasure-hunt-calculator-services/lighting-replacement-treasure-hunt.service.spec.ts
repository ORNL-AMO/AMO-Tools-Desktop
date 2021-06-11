import { TestBed } from '@angular/core/testing';

import { LightingReplacementTreasureHuntService } from './lighting-replacement-treasure-hunt.service';

describe('LightingReplacementTreasureHuntService', () => {
  let service: LightingReplacementTreasureHuntService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LightingReplacementTreasureHuntService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
