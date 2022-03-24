import { TestBed } from '@angular/core/testing';

import { AirPropertiesCsvService } from './air-properties-csv.service';

describe('AirPropertiesCsvService', () => {
  let service: AirPropertiesCsvService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AirPropertiesCsvService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
