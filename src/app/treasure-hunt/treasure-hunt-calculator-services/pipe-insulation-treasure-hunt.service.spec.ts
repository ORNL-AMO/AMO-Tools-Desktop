import { TestBed } from '@angular/core/testing';

import { PipeInsulationTreasureHuntService } from './pipe-insulation-treasure-hunt.service';

describe('PipeInsulationTreasureHuntService', () => {
  let service: PipeInsulationTreasureHuntService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PipeInsulationTreasureHuntService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
