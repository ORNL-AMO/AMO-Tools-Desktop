import { TestBed } from '@angular/core/testing';

import { ConvertCompressedAirInventoryService } from './convert-compressed-air-inventory.service';

describe('ConvertCompressedAirInventoryService', () => {
  let service: ConvertCompressedAirInventoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConvertCompressedAirInventoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
