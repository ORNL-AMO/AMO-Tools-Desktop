import { TestBed } from '@angular/core/testing';

import { ExportToJustifiCompressedAirService } from './export-to-justifi-compressed-air.service';

describe('ExportToJustifiCompressedAirService', () => {
  let service: ExportToJustifiCompressedAirService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportToJustifiCompressedAirService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
