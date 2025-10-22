import { TestBed } from '@angular/core/testing';

import { CentrifugalSpecificsCatalogService } from './centrifugal-specifics-catalog.service';

describe('CentrifugalSpecificsCatalogService', () => {
  let service: CentrifugalSpecificsCatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CentrifugalSpecificsCatalogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
