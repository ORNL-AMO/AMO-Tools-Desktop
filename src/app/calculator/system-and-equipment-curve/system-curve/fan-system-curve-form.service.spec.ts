import { TestBed } from '@angular/core/testing';

import { FanSystemCurveFormService } from './fan-system-curve-form.service';

describe('FanSystemCurveFormService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FanSystemCurveFormService = TestBed.get(FanSystemCurveFormService);
    expect(service).toBeTruthy();
  });
});
