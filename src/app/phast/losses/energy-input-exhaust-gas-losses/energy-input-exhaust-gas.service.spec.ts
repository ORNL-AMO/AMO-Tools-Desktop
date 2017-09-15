import { TestBed, inject } from '@angular/core/testing';

import { EnergyInputExhaustGasService } from './energy-input-exhaust-gas.service';

describe('EnergyInputExhaustGasService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EnergyInputExhaustGasService]
    });
  });

  it('should be created', inject([EnergyInputExhaustGasService], (service: EnergyInputExhaustGasService) => {
    expect(service).toBeTruthy();
  }));
});
