import { TestBed } from '@angular/core/testing';

import { FluidCatalogService } from './fluid-catalog.service';

describe('FluidCatalogService', () => {
  let service: FluidCatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FluidCatalogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
