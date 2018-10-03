import { TestBed, inject } from '@angular/core/testing';

import { SteamModelCalculationService } from './steam-model-calculation.service';

describe('SteamModelCalculationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SteamModelCalculationService]
    });
  });

  it('should be created', inject([SteamModelCalculationService], (service: SteamModelCalculationService) => {
    expect(service).toBeTruthy();
  }));
});
