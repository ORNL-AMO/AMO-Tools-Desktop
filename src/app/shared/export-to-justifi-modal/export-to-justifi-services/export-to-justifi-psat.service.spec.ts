import { TestBed } from '@angular/core/testing';

import { ExportToJustifiPsatService } from './export-to-justifi-psat.service';

describe('ExportToJustifiPsatService', () => {
  let service: ExportToJustifiPsatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportToJustifiPsatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
