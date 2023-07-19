import { TestBed } from '@angular/core/testing';

import { SystemCatalogService } from './system-catalog.service';

describe('SystemCatalogService', () => {
  let service: SystemCatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SystemCatalogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
