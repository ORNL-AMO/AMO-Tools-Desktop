import { TestBed } from '@angular/core/testing';

import { ReplaceExistingTreasureHuntService } from './replace-existing-treasure-hunt.service';

describe('ReplaceExistingTreasureHuntService', () => {
  let service: ReplaceExistingTreasureHuntService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReplaceExistingTreasureHuntService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
