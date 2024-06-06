import { TestBed } from '@angular/core/testing';

import { CompressedAirInventoryService } from './compressed-air-inventory.service';

describe('CompressedAirInventoryService', () => {
  let service: CompressedAirInventoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompressedAirInventoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
