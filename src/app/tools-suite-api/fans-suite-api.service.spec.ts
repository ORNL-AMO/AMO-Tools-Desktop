import { TestBed } from '@angular/core/testing';

import { FansSuiteApiService } from './fans-suite-api.service';

describe('FansSuiteApiService', () => {
  let service: FansSuiteApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FansSuiteApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
