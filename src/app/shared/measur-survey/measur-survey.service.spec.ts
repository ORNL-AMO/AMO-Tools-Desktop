import { TestBed } from '@angular/core/testing';

import { MeasurSurveyService } from './measur-survey.service';

describe('MeasurSurveyService', () => {
  let service: MeasurSurveyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MeasurSurveyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
