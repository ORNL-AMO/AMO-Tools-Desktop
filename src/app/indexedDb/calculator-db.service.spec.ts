import { TestBed, inject } from '@angular/core/testing';

import { CalculatorDbService } from './calculator-db.service';

describe('CalculatorDbService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CalculatorDbService]
    });
  });

  it('should be created', inject([CalculatorDbService], (service: CalculatorDbService) => {
    expect(service).toBeTruthy();
  }));
});
