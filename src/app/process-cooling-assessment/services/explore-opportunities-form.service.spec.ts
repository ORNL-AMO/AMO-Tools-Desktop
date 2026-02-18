import { TestBed } from '@angular/core/testing';

import { ExploreOpportunitiesFormService } from './explore-opportunities-form.service';

describe('ExploreOpportunitiesFormService', () => {
  let service: ExploreOpportunitiesFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExploreOpportunitiesFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
