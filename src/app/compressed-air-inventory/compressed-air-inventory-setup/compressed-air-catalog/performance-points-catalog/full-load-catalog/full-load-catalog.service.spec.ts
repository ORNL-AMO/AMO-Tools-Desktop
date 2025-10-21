import { TestBed } from '@angular/core/testing';

import { FullLoadCatalogService } from './full-load-catalog.service';

describe('FullLoadCatalogService', () => {
  let service: FullLoadCatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FullLoadCatalogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
