import { TestBed } from '@angular/core/testing';

import { BlowoffCatalogService } from './blowoff-catalog.service';

describe('BlowoffCatalogService', () => {
  let service: BlowoffCatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BlowoffCatalogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
