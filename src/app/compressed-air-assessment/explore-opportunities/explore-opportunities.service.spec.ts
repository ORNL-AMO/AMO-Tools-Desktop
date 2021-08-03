import { TestBed } from '@angular/core/testing';

import { ExploreOpportunitiesService } from './explore-opportunities.service';

describe('ExploreOpportunitiesService', () => {
  let service: ExploreOpportunitiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExploreOpportunitiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
