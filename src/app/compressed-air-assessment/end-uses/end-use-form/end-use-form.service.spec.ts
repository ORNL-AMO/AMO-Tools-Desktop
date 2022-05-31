import { TestBed } from '@angular/core/testing';

import { EndUseFormService } from './end-use-form.service';

describe('EndUseFormService', () => {
  let service: EndUseFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EndUseFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
