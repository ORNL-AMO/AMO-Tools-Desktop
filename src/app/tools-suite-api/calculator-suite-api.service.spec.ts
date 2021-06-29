import { TestBed } from '@angular/core/testing';

import { CalculatorSuiteApiService } from './calculator-suite-api.service';

describe('CalculatorSuiteApiService', () => {
  let service: CalculatorSuiteApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalculatorSuiteApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
