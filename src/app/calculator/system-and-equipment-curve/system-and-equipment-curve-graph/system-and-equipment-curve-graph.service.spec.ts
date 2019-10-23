import { TestBed } from '@angular/core/testing';

import { SystemAndEquipmentCurveGraphService } from './system-and-equipment-curve-graph.service';

describe('SystemAndEquipmentCurveGraphService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SystemAndEquipmentCurveGraphService = TestBed.get(SystemAndEquipmentCurveGraphService);
    expect(service).toBeTruthy();
  });
});
