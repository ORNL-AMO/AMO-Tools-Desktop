import { TestBed, inject } from '@angular/core/testing';

import { SlagCompareService } from './slag-compare.service';

describe('SlagCompareService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SlagCompareService]
    });
  });

  it('should be created', inject([SlagCompareService], (service: SlagCompareService) => {
    expect(service).toBeTruthy();
  }));
});
