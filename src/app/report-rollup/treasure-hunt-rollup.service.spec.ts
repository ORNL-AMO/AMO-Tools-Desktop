import { TestBed, inject } from '@angular/core/testing';

import { TreasureHuntRollupService } from './treasure-hunt-rollup.service';

describe('TreasureHuntRollupService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TreasureHuntRollupService]
    });
  });

  it('should be created', inject([TreasureHuntRollupService], (service: TreasureHuntRollupService) => {
    expect(service).toBeTruthy();
  }));
});
