import { TestBed } from '@angular/core/testing';

import { PumpMotorCatalogService } from './pump-motor-catalog.service';

describe('PumpMotorCatalogService', () => {
  let service: PumpMotorCatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PumpMotorCatalogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
