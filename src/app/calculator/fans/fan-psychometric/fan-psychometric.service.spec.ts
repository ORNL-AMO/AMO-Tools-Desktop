import { TestBed } from '@angular/core/testing';

import { FanPsychometricService } from './fan-psychometric.service';

describe('FanPsychometricService', () => {
  let service: FanPsychometricService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FanPsychometricService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
