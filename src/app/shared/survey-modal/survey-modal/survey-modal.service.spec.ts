import { TestBed } from '@angular/core/testing';

import { SurveyModalService } from './survey-modal.service';

describe('SurveyModalService', () => {
  let service: SurveyModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SurveyModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
