import { TestBed } from '@angular/core/testing';

import { OpeningTreasureHuntService } from './opening-treasure-hunt.service';

describe('OpeningTreasureHuntService', () => {
  let service: OpeningTreasureHuntService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpeningTreasureHuntService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
