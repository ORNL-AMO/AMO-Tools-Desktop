import { TestBed } from '@angular/core/testing';

import { WaterReductionService } from './water-reduction.service';

describe('WaterReductionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WaterReductionService = TestBed.get(WaterReductionService);
    expect(service).toBeTruthy();
  });
});
