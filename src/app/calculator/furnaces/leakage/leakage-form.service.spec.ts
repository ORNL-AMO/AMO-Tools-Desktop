import { TestBed } from '@angular/core/testing';

import { LeakageFormService } from './leakage-form.service';

describe('LeakageFormService', () => {
  let service: LeakageFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LeakageFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
