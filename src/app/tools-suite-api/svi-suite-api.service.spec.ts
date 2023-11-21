import { TestBed } from '@angular/core/testing';

import { SviSuiteApiService } from './svi-suite-api.service';

describe('SviSuiteApiService', () => {
  let service: SviSuiteApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SviSuiteApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
