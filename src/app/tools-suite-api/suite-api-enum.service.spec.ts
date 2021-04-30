import { TestBed } from '@angular/core/testing';

import { SuiteApiEnumService } from './suite-api-enum.service';

describe('SuiteApiEnumService', () => {
  let service: SuiteApiEnumService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SuiteApiEnumService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
