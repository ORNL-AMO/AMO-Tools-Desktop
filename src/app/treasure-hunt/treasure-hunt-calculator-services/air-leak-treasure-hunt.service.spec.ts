import { TestBed } from '@angular/core/testing';

import { AirLeakTreasureHuntService } from './air-leak-treasure-hunt.service';

describe('AirLeakTreasureHuntService', () => {
  let service: AirLeakTreasureHuntService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AirLeakTreasureHuntService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
