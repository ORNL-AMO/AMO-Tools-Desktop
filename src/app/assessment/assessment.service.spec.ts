/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AssessmentService } from './assessment.service';

describe('AssessmentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AssessmentService]
    });
  });

  it('should ...', inject([AssessmentService], (service: AssessmentService) => {
    expect(service).toBeTruthy();
  }));
});
