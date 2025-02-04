import { TestBed } from '@angular/core/testing';

import { CompressedAirControlsCatalogService } from './compressed-air-controls-catalog.service';

describe('CompressedAirControlsCatalogService', () => {
  let service: CompressedAirControlsCatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompressedAirControlsCatalogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
