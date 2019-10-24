import { TestBed } from '@angular/core/testing';

import { FanShaftPowerFormService } from './fan-shaft-power-form.service';

describe('FanShaftPowerFormService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FanShaftPowerFormService = TestBed.get(FanShaftPowerFormService);
    expect(service).toBeTruthy();
  });
});
