import { TestBed } from '@angular/core/testing';

import { ChillersSuiteApiService } from './chillers-suite-api.service';

describe('ChillersSuiteApiService', () => {
  let service: ChillersSuiteApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChillersSuiteApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
