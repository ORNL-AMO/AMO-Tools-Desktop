import { TestBed } from '@angular/core/testing';

import { InventoryDbService } from './inventory-db.service';

describe('InventoryDbService', () => {
  let service: InventoryDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventoryDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
