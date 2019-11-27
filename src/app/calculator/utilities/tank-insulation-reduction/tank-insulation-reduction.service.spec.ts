import { TestBed } from '@angular/core/testing';

import { TankInsulationReductionService } from './tank-insulation-reduction.service';

describe('TankInsulationReductionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TankInsulationReductionService = TestBed.get(TankInsulationReductionService);
    expect(service).toBeTruthy();
  });
});
