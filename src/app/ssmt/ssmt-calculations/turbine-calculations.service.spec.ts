import { TestBed, inject } from '@angular/core/testing';

import { TurbineCalculationsService } from './turbine-calculations.service';

describe('TurbineCalculationsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TurbineCalculationsService]
    });
  });

  it('should be created', inject([TurbineCalculationsService], (service: TurbineCalculationsService) => {
    expect(service).toBeTruthy();
  }));
});
