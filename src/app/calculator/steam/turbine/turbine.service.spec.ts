import { TestBed, inject } from '@angular/core/testing';

import { TurbineService } from './turbine.service';

describe('TurbineService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TurbineService]
    });
  });

  it('should be created', inject([TurbineService], (service: TurbineService) => {
    expect(service).toBeTruthy();
  }));
});
