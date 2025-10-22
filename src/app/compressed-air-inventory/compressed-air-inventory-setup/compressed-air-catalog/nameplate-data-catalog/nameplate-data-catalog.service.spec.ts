import { TestBed } from '@angular/core/testing';

import { NameplateDataCatalogService } from './nameplate-data-catalog.service';

describe('NameplateDataCatalogService', () => {
  let service: NameplateDataCatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NameplateDataCatalogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
