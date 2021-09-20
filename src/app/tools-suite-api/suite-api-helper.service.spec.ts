import { TestBed } from '@angular/core/testing';

import { SuiteApiHelperService } from './suite-api-helper.service';

describe('SuiteApiHelperService', () => {
  let service: SuiteApiHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SuiteApiHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
