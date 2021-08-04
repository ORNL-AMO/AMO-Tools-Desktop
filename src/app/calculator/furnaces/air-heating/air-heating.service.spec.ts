import { TestBed } from '@angular/core/testing';

import { AirHeatingService } from './air-heating.service';

describe('AirHeatingService', () => {
  let service: AirHeatingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AirHeatingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
