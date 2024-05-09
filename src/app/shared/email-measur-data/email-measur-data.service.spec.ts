import { TestBed } from '@angular/core/testing';

import { EmailMeasurDataService } from './email-measur-data.service';

describe('EmailMeasurDataService', () => {
  let service: EmailMeasurDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmailMeasurDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
