import { TestBed } from '@angular/core/testing';

import { SystemCurveFormService } from './system-curve-form.service';

describe('SystemCurveFormService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SystemCurveFormService = TestBed.get(SystemCurveFormService);
    expect(service).toBeTruthy();
  });
});
