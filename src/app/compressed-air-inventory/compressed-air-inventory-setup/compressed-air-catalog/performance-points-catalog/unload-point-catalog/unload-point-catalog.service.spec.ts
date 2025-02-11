import { TestBed } from '@angular/core/testing';

import { UnloadPointCatalogService } from './unload-point-catalog.service';

describe('UnloadPointCatalogService', () => {
  let service: UnloadPointCatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnloadPointCatalogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
