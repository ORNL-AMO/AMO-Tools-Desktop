import { TestBed } from '@angular/core/testing';

import { ExportToJustifiPhastService } from './export-to-justifi-phast.service';

describe('ExportToJustifiPhastService', () => {
  let service: ExportToJustifiPhastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportToJustifiPhastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
