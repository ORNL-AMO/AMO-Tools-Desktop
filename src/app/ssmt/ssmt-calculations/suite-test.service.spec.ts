import { TestBed, inject } from '@angular/core/testing';

import { SuiteTestService } from './suite-test.service';

describe('SuiteTestService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SuiteTestService]
    });
  });

  it('should be created', inject([SuiteTestService], (service: SuiteTestService) => {
    expect(service).toBeTruthy();
  }));
});
