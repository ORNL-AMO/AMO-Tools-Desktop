import { TestBed } from '@angular/core/testing';

import { ExportToJustifiSsmtService } from './export-to-justifi-ssmt.service';

describe('ExportToJustifiSsmtService', () => {
  let service: ExportToJustifiSsmtService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportToJustifiSsmtService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
