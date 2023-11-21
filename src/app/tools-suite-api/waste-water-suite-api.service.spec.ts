import { TestBed } from '@angular/core/testing';

import { WasteWaterSuiteApiService } from './waste-water-suite-api.service';

describe('WasteWaterSuiteApiService', () => {
  let service: WasteWaterSuiteApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WasteWaterSuiteApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
