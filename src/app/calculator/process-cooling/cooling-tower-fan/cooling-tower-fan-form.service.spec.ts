import { TestBed } from '@angular/core/testing';

import { CoolingTowerFanFormService } from './cooling-tower-fan-form.service';

describe('CoolingTowerFanFormService', () => {
  let service: CoolingTowerFanFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoolingTowerFanFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
