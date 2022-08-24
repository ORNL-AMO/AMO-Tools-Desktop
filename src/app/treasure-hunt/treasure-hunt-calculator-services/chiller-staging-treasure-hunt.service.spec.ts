import { TestBed } from '@angular/core/testing';

import { ChillerStagingTreasureHuntService } from './chiller-staging-treasure-hunt.service';

describe('ChillerStagingTreasureHuntService', () => {
  let service: ChillerStagingTreasureHuntService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChillerStagingTreasureHuntService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
