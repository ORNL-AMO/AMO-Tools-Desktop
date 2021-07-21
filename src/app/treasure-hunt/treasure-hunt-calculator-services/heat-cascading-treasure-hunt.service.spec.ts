import { TestBed } from '@angular/core/testing';

import { HeatCascadingTreasureHuntService } from './heat-cascading-treasure-hunt.service';

describe('HeatCascadingTreasureHuntService', () => {
  let service: HeatCascadingTreasureHuntService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeatCascadingTreasureHuntService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
