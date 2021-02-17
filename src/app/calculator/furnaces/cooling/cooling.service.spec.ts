import { TestBed } from '@angular/core/testing';

import { CoolingService } from './cooling.service';

describe('CoolingService', () => {
  let service: CoolingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoolingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
