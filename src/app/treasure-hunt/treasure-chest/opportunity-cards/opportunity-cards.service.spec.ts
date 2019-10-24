import { TestBed } from '@angular/core/testing';

import { OpportunityCardsService } from './opportunity-cards.service';

describe('OpportunityCardsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OpportunityCardsService = TestBed.get(OpportunityCardsService);
    expect(service).toBeTruthy();
  });
});
