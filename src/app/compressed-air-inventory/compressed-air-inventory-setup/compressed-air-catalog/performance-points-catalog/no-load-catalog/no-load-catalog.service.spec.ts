import { TestBed } from '@angular/core/testing';

import { NoLoadCatalogService } from './no-load-catalog.service';

describe('NoLoadCatalogService', () => {
  let service: NoLoadCatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NoLoadCatalogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
