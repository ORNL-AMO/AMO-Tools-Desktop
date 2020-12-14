import { TestBed } from '@angular/core/testing';

import { ChargeMaterialService } from './charge-material.service';

describe('ChargeMaterialService', () => {
  let service: ChargeMaterialService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChargeMaterialService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
