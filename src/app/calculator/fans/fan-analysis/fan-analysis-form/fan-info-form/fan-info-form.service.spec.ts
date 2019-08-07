import { TestBed } from '@angular/core/testing';

import { FanInfoFormService } from './fan-info-form.service';

describe('FanInfoFormService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FanInfoFormService = TestBed.get(FanInfoFormService);
    expect(service).toBeTruthy();
  });
});
