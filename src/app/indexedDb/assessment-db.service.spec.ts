import { TestBed, inject } from '@angular/core/testing';

import { AssessmentDbService } from './assessment-db.service';

describe('AssessmentDbService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AssessmentDbService]
    });
  });

  it('should be created', inject([AssessmentDbService], (service: AssessmentDbService) => {
    expect(service).toBeTruthy();
  }));
});
