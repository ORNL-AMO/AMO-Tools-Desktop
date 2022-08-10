import { TestBed } from '@angular/core/testing';

import { DayTypeUseFormService } from './day-type-use-form.service';

describe('DayTypeUseFormService', () => {
  let service: DayTypeUseFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DayTypeUseFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
