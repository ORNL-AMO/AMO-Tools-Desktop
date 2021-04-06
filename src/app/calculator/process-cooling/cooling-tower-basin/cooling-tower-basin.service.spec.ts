import { TestBed } from '@angular/core/testing';

import { CoolingTowerBasinService } from './cooling-tower-basin.service';

describe('CoolingTowerBasinService', () => {
  let service: CoolingTowerBasinService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoolingTowerBasinService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
