import { TestBed } from '@angular/core/testing';

import { StandaloneSuiteApiService } from './standalone-suite-api.service';

describe('StandaloneSuiteApiService', () => {
  let service: StandaloneSuiteApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StandaloneSuiteApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
