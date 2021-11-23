import { TestBed } from '@angular/core/testing';

import { AssessmentCo2SavingsService } from './assessment-co2-savings.service';

describe('AssessmentCo2SavingsService', () => {
  let service: AssessmentCo2SavingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssessmentCo2SavingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
