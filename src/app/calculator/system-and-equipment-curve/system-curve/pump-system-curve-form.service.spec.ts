import { TestBed } from '@angular/core/testing';

import { PumpSystemCurveFormService } from './pump-system-curve-form.service';

describe('PumpSystemCurveFormService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PumpSystemCurveFormService = TestBed.get(PumpSystemCurveFormService);
    expect(service).toBeTruthy();
  });
});
