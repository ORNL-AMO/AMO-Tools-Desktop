import { TestBed, inject } from '@angular/core/testing';

import { FanEfficiencyService } from './fan-efficiency.service';

describe('FanEfficiencyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FanEfficiencyService]
    });
  });

  it('should be created', inject([FanEfficiencyService], (service: FanEfficiencyService) => {
    expect(service).toBeTruthy();
  }));
});
