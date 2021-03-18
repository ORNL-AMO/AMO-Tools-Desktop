import { TestBed } from '@angular/core/testing';

import { WasteWaterService } from './waste-water.service';

describe('WasteWaterService', () => {
  let service: WasteWaterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WasteWaterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
