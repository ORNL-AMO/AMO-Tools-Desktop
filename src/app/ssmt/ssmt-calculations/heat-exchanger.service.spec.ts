import { TestBed, inject } from '@angular/core/testing';

import { HeatExchangerService } from './heat-exchanger.service';

describe('HeatExchangerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HeatExchangerService]
    });
  });

  it('should be created', inject([HeatExchangerService], (service: HeatExchangerService) => {
    expect(service).toBeTruthy();
  }));
});
