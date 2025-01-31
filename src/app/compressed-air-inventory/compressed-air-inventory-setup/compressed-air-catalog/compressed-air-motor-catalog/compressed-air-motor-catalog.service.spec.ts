import { TestBed } from '@angular/core/testing';

import { CompressedAirMotorCatalogService } from './compressed-air-motor-catalog.service';

describe('CompressedAirMotorCatalogService', () => {
  let service: CompressedAirMotorCatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompressedAirMotorCatalogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
