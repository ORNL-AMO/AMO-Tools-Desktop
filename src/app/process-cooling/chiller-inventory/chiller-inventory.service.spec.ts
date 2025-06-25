import { TestBed } from '@angular/core/testing';

import { ChillerInventoryService } from './chiller-inventory.service';

describe('ChillerInventoryService', () => {
  let service: ChillerInventoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChillerInventoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
