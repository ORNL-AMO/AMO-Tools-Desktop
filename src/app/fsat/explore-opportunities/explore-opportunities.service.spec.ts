import { TestBed, inject } from '@angular/core/testing';

import { ExploreOpportunitiesService } from './explore-opportunities.service';

describe('ExploreOpportunitiesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExploreOpportunitiesService]
    });
  });

  it('should be created', inject([ExploreOpportunitiesService], (service: ExploreOpportunitiesService) => {
    expect(service).toBeTruthy();
  }));
});
