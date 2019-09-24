import { TestBed } from '@angular/core/testing';

import { PumpCurveFormService } from './pump-curve-form.service';

describe('PumpCurveFormService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PumpCurveFormService = TestBed.get(PumpCurveFormService);
    expect(service).toBeTruthy();
  });
});
