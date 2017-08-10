import { TestBed, inject } from '@angular/core/testing';

import { AuxEquipmentService } from './aux-equipment.service';

describe('AuxEquipmentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuxEquipmentService]
    });
  });

  it('should be created', inject([AuxEquipmentService], (service: AuxEquipmentService) => {
    expect(service).toBeTruthy();
  }));
});
