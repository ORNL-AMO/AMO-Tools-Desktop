import { TestBed } from '@angular/core/testing';

import { CompressedAirCatalogService } from './compressed-air-catalog.service';

describe('CompressedAirCatalogService', () => {
  let service: CompressedAirCatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompressedAirCatalogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
