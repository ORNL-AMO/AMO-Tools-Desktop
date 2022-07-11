import { TestBed } from '@angular/core/testing';

import { CoolingTowerFanService } from './cooling-tower-fan.service';

describe('CoolingTowerFanService', () => {
  let service: CoolingTowerFanService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoolingTowerFanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
