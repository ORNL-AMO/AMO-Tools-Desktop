import { TestBed } from '@angular/core/testing';

import { CompressedAirSuiteApiService } from './compressed-air-suite-api.service';

describe('CompressedAirSuiteApiService', () => {
  let service: CompressedAirSuiteApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompressedAirSuiteApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
