import { TestBed } from '@angular/core/testing';

import { ConvertPumpInventoryService } from './convert-pump-inventory.service';

describe('ConvertPumpInventoryService', () => {
  let service: ConvertPumpInventoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConvertPumpInventoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
