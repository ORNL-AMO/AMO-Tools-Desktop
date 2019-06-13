import { TestBed, inject } from '@angular/core/testing';

import { ElectricityReductionService } from './electricity-reduction.service';

describe('ElectricityReductionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ElectricityReductionService]
    });
  });

  it('should be created', inject([ElectricityReductionService], (service: ElectricityReductionService) => {
    expect(service).toBeTruthy();
  }));
});
