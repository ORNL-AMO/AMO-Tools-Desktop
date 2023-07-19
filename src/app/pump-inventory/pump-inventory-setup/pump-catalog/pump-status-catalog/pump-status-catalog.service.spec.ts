import { TestBed } from '@angular/core/testing';

import { PumpStatusCatalogService } from './pump-status-catalog.service';

describe('PumpStatusCatalogService', () => {
  let service: PumpStatusCatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PumpStatusCatalogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
