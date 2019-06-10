import { TestBed, inject } from '@angular/core/testing';

import { EfficiencyImprovementService } from './efficiency-improvement.service';

describe('EfficiencyImprovementService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EfficiencyImprovementService]
    });
  });

  it('should be created', inject([EfficiencyImprovementService], (service: EfficiencyImprovementService) => {
    expect(service).toBeTruthy();
  }));
});
