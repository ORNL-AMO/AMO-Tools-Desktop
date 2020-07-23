import { TestBed } from '@angular/core/testing';

import { RequiredMotorDataService } from './required-motor-data.service';

describe('RequiredMotorDataService', () => {
  let service: RequiredMotorDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RequiredMotorDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
