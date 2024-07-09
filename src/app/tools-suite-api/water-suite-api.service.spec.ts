import { TestBed } from '@angular/core/testing';

import { WaterSuiteApiService } from './water-suite-api.service';

describe('WaterSuiteApiService', () => {
  let service: WaterSuiteApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WaterSuiteApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
