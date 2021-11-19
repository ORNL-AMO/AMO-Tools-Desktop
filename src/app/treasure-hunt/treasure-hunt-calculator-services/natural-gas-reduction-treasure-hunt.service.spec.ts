import { TestBed } from '@angular/core/testing';

import { NaturalGasReductionTreasureHuntService } from './natural-gas-reduction-treasure-hunt.service';

describe('NaturalGasReductionTreasureHuntService', () => {
  let service: NaturalGasReductionTreasureHuntService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NaturalGasReductionTreasureHuntService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
