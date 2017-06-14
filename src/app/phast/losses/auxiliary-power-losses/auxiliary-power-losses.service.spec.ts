import { TestBed, inject } from '@angular/core/testing';

import { AuxiliaryPowerLossesService } from './auxiliary-power-losses.service';

describe('AuxiliaryPowerLossesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuxiliaryPowerLossesService]
    });
  });

  it('should be created', inject([AuxiliaryPowerLossesService], (service: AuxiliaryPowerLossesService) => {
    expect(service).toBeTruthy();
  }));
});
