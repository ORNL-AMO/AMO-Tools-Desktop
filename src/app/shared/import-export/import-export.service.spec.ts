import { TestBed, inject } from '@angular/core/testing';

import { ImportExportService } from './import-export.service';

describe('ImportExportService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ImportExportService]
    });
  });

  it('should be created', inject([ImportExportService], (service: ImportExportService) => {
    expect(service).toBeTruthy();
  }));
});
