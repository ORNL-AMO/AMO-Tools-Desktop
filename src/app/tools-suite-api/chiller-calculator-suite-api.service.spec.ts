import { TestBed } from '@angular/core/testing';

import { ChillerCalculatorSuiteApiService } from './chiller-calculator-suite-api.service';

describe('ChillerCalculatorSuiteApiService', () => {
  let service: ChillerCalculatorSuiteApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChillerCalculatorSuiteApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
