import { TestBed } from '@angular/core/testing';

import { SortCardsService } from './sort-cards.service';

describe('SortCardsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SortCardsService = TestBed.get(SortCardsService);
    expect(service).toBeTruthy();
  });
});
