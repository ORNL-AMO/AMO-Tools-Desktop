import { TestBed, inject } from '@angular/core/testing';

import { CombinedHeatPowerService } from './combined-heat-power.service';

describe('CombinedHeatPowerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CombinedHeatPowerService]
    });
  });

  it('should be created', inject([CombinedHeatPowerService], (service: CombinedHeatPowerService) => {
    expect(service).toBeTruthy();
  }));
});
