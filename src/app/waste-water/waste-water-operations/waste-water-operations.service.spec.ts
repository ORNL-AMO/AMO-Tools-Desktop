import { TestBed } from '@angular/core/testing';

import { WasteWaterOperationsService } from './waste-water-operations.service';

describe('WasteWaterOperationsService', () => {
  let service: WasteWaterOperationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WasteWaterOperationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
