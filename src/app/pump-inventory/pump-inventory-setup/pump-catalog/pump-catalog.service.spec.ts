import { TestBed } from '@angular/core/testing';

import { PumpCatalogService } from './pump-catalog.service';

describe('PumpCatalogService', () => {
  let service: PumpCatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PumpCatalogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
