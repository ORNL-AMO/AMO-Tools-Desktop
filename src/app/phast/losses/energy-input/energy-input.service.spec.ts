import { TestBed, inject } from '@angular/core/testing';

import { EnergyInputService } from './energy-input.service';

describe('EnergyInputService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EnergyInputService]
    });
  });

  it('should be created', inject([EnergyInputService], (service: EnergyInputService) => {
    expect(service).toBeTruthy();
  }));
});
