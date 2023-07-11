import { TestBed } from '@angular/core/testing';

import { PumpEquipmentCatalogService } from './pump-equipment-catalog.service';

describe('PumpEquipmentCatalogService', () => {
  let service: PumpEquipmentCatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PumpEquipmentCatalogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
