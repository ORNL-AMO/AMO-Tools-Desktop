import { TestBed, inject } from '@angular/core/testing';

import { PercentLoadEstimationService } from './percent-load-estimation.service';

describe('PercentLoadEstimationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PercentLoadEstimationService]
    });
  });

  it('should be created', inject([PercentLoadEstimationService], (service: PercentLoadEstimationService) => {
    expect(service).toBeTruthy();
  }));
});
