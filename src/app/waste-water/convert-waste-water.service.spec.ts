import { TestBed } from '@angular/core/testing';

import { ConvertWasteWaterService } from './convert-waste-water.service';

describe('ConvertWasteWaterService', () => {
  let service: ConvertWasteWaterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConvertWasteWaterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
