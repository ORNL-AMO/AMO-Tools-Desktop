import { TestBed } from '@angular/core/testing';

import { PumpsSuiteApiService } from './pumps-suite-api.service';

describe('PumpsSuiteApiService', () => {
  let service: PumpsSuiteApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PumpsSuiteApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
