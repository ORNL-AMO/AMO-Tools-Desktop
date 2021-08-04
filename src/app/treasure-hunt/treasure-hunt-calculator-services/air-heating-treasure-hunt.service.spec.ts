import { TestBed } from '@angular/core/testing';

import { AirHeatingTreasureHuntService } from './air-heating-treasure-hunt.service';

describe('AirHeatingTreasureHuntService', () => {
  let service: AirHeatingTreasureHuntService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AirHeatingTreasureHuntService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
