import { TestBed } from '@angular/core/testing';

import { PerformancePointsCatalogService } from './performance-points-catalog.service';

describe('PerformancePointsCatalogService', () => {
  let service: PerformancePointsCatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PerformancePointsCatalogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
