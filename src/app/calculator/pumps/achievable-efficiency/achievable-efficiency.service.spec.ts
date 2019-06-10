import { TestBed, inject } from '@angular/core/testing';

import { AchievableEfficiencyService } from './achievable-efficiency.service';

describe('AchievableEfficiencyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AchievableEfficiencyService]
    });
  });

  it('should be created', inject([AchievableEfficiencyService], (service: AchievableEfficiencyService) => {
    expect(service).toBeTruthy();
  }));
});
