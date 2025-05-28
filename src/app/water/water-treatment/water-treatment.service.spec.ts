import { TestBed } from '@angular/core/testing';

import { WaterTreatmentService } from './water-treatment.service';

describe('WaterTreatmentService', () => {
  let service: WaterTreatmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WaterTreatmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
