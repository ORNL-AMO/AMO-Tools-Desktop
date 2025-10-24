import { TestBed } from '@angular/core/testing';

import { FieldMeasurementsCatalogService } from './field-measurements-catalog.service';

describe('FieldMeasurementsCatalogService', () => {
  let service: FieldMeasurementsCatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FieldMeasurementsCatalogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
