import { TestBed, inject } from '@angular/core/testing';

import { FlueGasCompareService } from './flue-gas-compare.service';

describe('FlueGasCompareService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FlueGasCompareService]
    });
  });

  it('should be created', inject([FlueGasCompareService], (service: FlueGasCompareService) => {
    expect(service).toBeTruthy();
  }));
});
