import { TestBed } from '@angular/core/testing';

import { PumpInventoryService } from './pump-inventory.service';

describe('PumpInventoryService', () => {
  let service: PumpInventoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PumpInventoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
