import { TestBed } from '@angular/core/testing';

import { TurndownCatalogService } from './turndown-catalog.service';

describe('TurndownCatalogService', () => {
  let service: TurndownCatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TurndownCatalogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
