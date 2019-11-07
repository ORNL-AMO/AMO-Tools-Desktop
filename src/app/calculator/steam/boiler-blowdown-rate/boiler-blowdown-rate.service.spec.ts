import { TestBed } from '@angular/core/testing';

import { BoilerBlowdownRateService } from './boiler-blowdown-rate.service';

describe('BoilerBlowdownRateService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BoilerBlowdownRateService = TestBed.get(BoilerBlowdownRateService);
    expect(service).toBeTruthy();
  });
});
