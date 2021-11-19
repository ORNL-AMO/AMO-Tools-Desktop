import { TestBed } from '@angular/core/testing';

import { ElectricityReductionTreasureHuntService } from './electricity-reduction-treasure-hunt.service';

describe('ElectricityReductionTreasureHuntService', () => {
  let service: ElectricityReductionTreasureHuntService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ElectricityReductionTreasureHuntService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
