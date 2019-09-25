import { TestBed } from '@angular/core/testing';

import { FanCurveFormService } from './fan-curve-form.service';

describe('FanCurveFormService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FanCurveFormService = TestBed.get(FanCurveFormService);
    expect(service).toBeTruthy();
  });
});
