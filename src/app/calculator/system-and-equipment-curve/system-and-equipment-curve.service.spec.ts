import { TestBed } from '@angular/core/testing';

import { SystemAndEquipmentCurveService } from './system-and-equipment-curve.service';

describe('SystemAndEquipmentCurveService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SystemAndEquipmentCurveService = TestBed.get(SystemAndEquipmentCurveService);
    expect(service).toBeTruthy();
  });
});
