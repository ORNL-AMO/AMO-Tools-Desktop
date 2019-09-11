import { TestBed } from '@angular/core/testing';

import { ImportOpportunitiesService } from './import-opportunities.service';

describe('ImportOpportunitiesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ImportOpportunitiesService = TestBed.get(ImportOpportunitiesService);
    expect(service).toBeTruthy();
  });
});
