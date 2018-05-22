import { TestBed, inject } from '@angular/core/testing';

import { FieldMeasurementService } from './field-measurement.service';

describe('FieldMeasurementService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FieldMeasurementService]
    });
  });

  it('should be created', inject([FieldMeasurementService], (service: FieldMeasurementService) => {
    expect(service).toBeTruthy();
  }));
});
