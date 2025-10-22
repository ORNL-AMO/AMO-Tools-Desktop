import { TestBed } from '@angular/core/testing';

import { MidTurndownCatalogService } from './mid-turndown-catalog.service';

describe('MidTurndownCatalogService', () => {
  let service: MidTurndownCatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MidTurndownCatalogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
