import { TestBed } from '@angular/core/testing';

import { MotorCatalogService } from './motor-catalog.service';

describe('MotorCatalogService', () => {
  let service: MotorCatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MotorCatalogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
