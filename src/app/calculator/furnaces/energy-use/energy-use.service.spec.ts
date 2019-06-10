import { TestBed, inject } from '@angular/core/testing';

import { EnergyUseService } from './energy-use.service';

describe('EnergyUseService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EnergyUseService]
    });
  });

  it('should be created', inject([EnergyUseService], (service: EnergyUseService) => {
    expect(service).toBeTruthy();
  }));
});
