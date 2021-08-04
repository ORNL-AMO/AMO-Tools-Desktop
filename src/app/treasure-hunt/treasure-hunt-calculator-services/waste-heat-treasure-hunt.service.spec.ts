import { TestBed } from '@angular/core/testing';

import { WasteHeatTreasureHuntService } from './waste-heat-treasure-hunt.service';

describe('WasteHeatTreasureHuntService', () => {
  let service: WasteHeatTreasureHuntService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WasteHeatTreasureHuntService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
