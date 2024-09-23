import { TestBed } from '@angular/core/testing';

import { WasteWaterTreatmentService } from './waste-water-treatment.service';

describe('WasteWaterTreatmentService', () => {
  let service: WasteWaterTreatmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WasteWaterTreatmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
