import { TestBed, inject } from '@angular/core/testing';

import { WaterCoolingLossesService } from './water-cooling-losses.service';

describe('WaterCoolingLossesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WaterCoolingLossesService]
    });
  });

  it('should ...', inject([WaterCoolingLossesService], (service: WaterCoolingLossesService) => {
    expect(service).toBeTruthy();
  }));
});
