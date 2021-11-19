import { TestBed } from '@angular/core/testing';

import { FlueGasTreasureHuntService } from './flue-gas-treasure-hunt.service';

describe('FlueGasTreasureHuntService', () => {
  let service: FlueGasTreasureHuntService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlueGasTreasureHuntService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
