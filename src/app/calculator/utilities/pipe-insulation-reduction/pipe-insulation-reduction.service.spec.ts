import { TestBed } from '@angular/core/testing';

import { PipeInsulationReductionService } from './pipe-insulation-reduction.service';

describe('PipeInsulationReductionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PipeInsulationReductionService = TestBed.get(PipeInsulationReductionService);
    expect(service).toBeTruthy();
  });
});
