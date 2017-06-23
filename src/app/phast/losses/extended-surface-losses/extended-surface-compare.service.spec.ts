import { TestBed, inject } from '@angular/core/testing';

import { ExtendedSurfaceCompareService } from './extended-surface-compare.service';

describe('ExtendedSurfaceCompareService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExtendedSurfaceCompareService]
    });
  });

  it('should be created', inject([ExtendedSurfaceCompareService], (service: ExtendedSurfaceCompareService) => {
    expect(service).toBeTruthy();
  }));
});
