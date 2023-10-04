import { TestBed } from '@angular/core/testing';

import { AssessmentOpportunityService } from './assessment-opportunity.service';

describe('AssessmentOpportunityService', () => {
  let service: AssessmentOpportunityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssessmentOpportunityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
