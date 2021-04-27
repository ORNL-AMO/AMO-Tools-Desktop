import { TestBed } from '@angular/core/testing';

import { TreasureHuntOpportunityService } from './treasure-hunt-opportunity.service';

describe('TreasureHuntOpportunityService', () => {
  let service: TreasureHuntOpportunityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TreasureHuntOpportunityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
