import { TestBed } from '@angular/core/testing';

import { AirHeatingFormService } from './air-heating-form.service';

describe('AirHeatingFormService', () => {
  let service: AirHeatingFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AirHeatingFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
