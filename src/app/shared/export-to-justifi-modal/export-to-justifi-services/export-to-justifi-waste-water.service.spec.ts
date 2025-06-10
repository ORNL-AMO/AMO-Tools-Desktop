import { TestBed } from '@angular/core/testing';

import { ExportToJustifiWasteWaterService } from './export-to-justifi-waste-water.service';

describe('ExportToJustifiWasteWaterService', () => {
  let service: ExportToJustifiWasteWaterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportToJustifiWasteWaterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
