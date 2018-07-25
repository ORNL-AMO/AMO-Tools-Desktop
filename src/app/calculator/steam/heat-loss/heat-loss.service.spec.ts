import { TestBed, inject } from '@angular/core/testing';

import { HeatLossService } from './heat-loss.service';

describe('HeatLossService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HeatLossService]
    });
  });

  it('should be created', inject([HeatLossService], (service: HeatLossService) => {
    expect(service).toBeTruthy();
  }));
});
