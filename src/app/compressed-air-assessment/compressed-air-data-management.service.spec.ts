import { TestBed } from '@angular/core/testing';

import { CompressedAirDataManagementService } from './compressed-air-data-management.service';

describe('CompressedAirDataManagementService', () => {
  let service: CompressedAirDataManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompressedAirDataManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
