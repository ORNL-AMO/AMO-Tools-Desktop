import { TestBed } from '@angular/core/testing';

import { ChillerPerformanceTreasureHuntService } from './chiller-performance-treasure-hunt.service';

describe('ChillerPerformanceTreasureHuntService', () => {
  let service: ChillerPerformanceTreasureHuntService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChillerPerformanceTreasureHuntService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
