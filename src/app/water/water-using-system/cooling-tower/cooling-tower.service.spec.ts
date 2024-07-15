import { TestBed } from '@angular/core/testing';

import { CoolingTowerService } from './cooling-tower.service';

describe('CoolingTowerService', () => {
  let service: CoolingTowerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoolingTowerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
