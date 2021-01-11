import { TestBed } from '@angular/core/testing';

import { OpeningFormService } from './opening-form.service';

describe('OpeningFormService', () => {
  let service: OpeningFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpeningFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
