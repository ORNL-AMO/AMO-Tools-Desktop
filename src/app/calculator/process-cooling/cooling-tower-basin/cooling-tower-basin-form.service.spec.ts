import { TestBed } from '@angular/core/testing';

import { CoolingTowerBasinFormService } from './cooling-tower-basin-form.service';

describe('CoolingTowerBasinFormService', () => {
  let service: CoolingTowerBasinFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoolingTowerBasinFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
