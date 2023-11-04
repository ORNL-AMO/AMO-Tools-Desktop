import { TestBed } from '@angular/core/testing';

import { AssessmentIntegrationService } from './assessment-integration.service';

describe('AssessmentIntegrationService', () => {
  let service: AssessmentIntegrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssessmentIntegrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
