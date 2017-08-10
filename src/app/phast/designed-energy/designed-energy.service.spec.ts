import { TestBed, inject } from '@angular/core/testing';

import { DesignedEnergyService } from './designed-energy.service';

describe('DesignedEnergyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DesignedEnergyService]
    });
  });

  it('should be created', inject([DesignedEnergyService], (service: DesignedEnergyService) => {
    expect(service).toBeTruthy();
  }));
});
