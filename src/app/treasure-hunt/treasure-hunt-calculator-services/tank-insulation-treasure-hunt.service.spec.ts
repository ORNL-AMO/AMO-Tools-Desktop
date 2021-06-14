import { TestBed } from '@angular/core/testing';

import { TankInsulationTreasureHuntService } from './tank-insulation-treasure-hunt.service';

describe('TankInsulationTreasureHuntService', () => {
  let service: TankInsulationTreasureHuntService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TankInsulationTreasureHuntService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
