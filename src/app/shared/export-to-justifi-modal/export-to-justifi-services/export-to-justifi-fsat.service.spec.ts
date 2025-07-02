import { TestBed } from '@angular/core/testing';

import { ExportToJustifiFsatService } from './export-to-justifi-fsat.service';

describe('ExportToJustifiFsatService', () => {
  let service: ExportToJustifiFsatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportToJustifiFsatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
