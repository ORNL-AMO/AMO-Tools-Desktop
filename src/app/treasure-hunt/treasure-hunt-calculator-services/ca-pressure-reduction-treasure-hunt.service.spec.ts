import { TestBed } from '@angular/core/testing';

import { CaPressureReductionTreasureHuntService } from './ca-pressure-reduction-treasure-hunt.service';

describe('CaPressureReductionTreasureHuntService', () => {
  let service: CaPressureReductionTreasureHuntService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaPressureReductionTreasureHuntService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
