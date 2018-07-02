import { TestBed, inject } from '@angular/core/testing';

import { OperationsCompareService } from './operations-compare.service';

describe('OperationsCompareService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OperationsCompareService]
    });
  });

  it('should be created', inject([OperationsCompareService], (service: OperationsCompareService) => {
    expect(service).toBeTruthy();
  }));
});
