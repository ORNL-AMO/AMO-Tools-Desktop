import { TestBed } from '@angular/core/testing';

import { AirLeakFormService } from './air-leak-form.service';

describe('AirLeakFormService', () => {
  let service: AirLeakFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AirLeakFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
