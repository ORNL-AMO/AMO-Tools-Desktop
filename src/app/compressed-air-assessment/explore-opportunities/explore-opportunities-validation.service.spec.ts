import { TestBed } from '@angular/core/testing';

import { ExploreOpportunitiesValidationService } from './explore-opportunities-validation.service';

describe('ExploreOpportunitiesValidationService', () => {
  let service: ExploreOpportunitiesValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExploreOpportunitiesValidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
