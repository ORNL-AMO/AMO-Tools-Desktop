import { TestBed } from '@angular/core/testing';

import { DesignDetailsCatalogService } from './design-details-catalog.service';

describe('DesignDetailsCatalogService', () => {
  let service: DesignDetailsCatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DesignDetailsCatalogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
