import { TestBed, inject } from '@angular/core/testing';

import { ImportExport2Service } from './import-export-2.service';

describe('ImportExport2Service', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ImportExport2Service]
    });
  });

  it('should be created', inject([ImportExport2Service], (service: ImportExport2Service) => {
    expect(service).toBeTruthy();
  }));
});
