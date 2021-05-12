import { TestBed } from '@angular/core/testing';

import { CaReductionTreasureHuntService } from './ca-reduction-treasure-hunt.service';

describe('CaReductionTreasureHuntService', () => {
  let service: CaReductionTreasureHuntService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaReductionTreasureHuntService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
