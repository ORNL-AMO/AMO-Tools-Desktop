import { TestBed } from '@angular/core/testing';

import { EquipmentCurveService } from './equipment-curve.service';

describe('EquipmentCurveService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EquipmentCurveService = TestBed.get(EquipmentCurveService);
    expect(service).toBeTruthy();
  });
});
