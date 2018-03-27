import { TestBed, inject } from '@angular/core/testing';

import { PhastCompareService } from './phast-compare.service';

describe('PhastCompareService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PhastCompareService]
    });
  });

  it('should be created', inject([PhastCompareService], (service: PhastCompareService) => {
    expect(service).toBeTruthy();
  }));
});
