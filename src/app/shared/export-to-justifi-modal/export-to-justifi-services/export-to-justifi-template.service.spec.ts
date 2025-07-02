import { TestBed } from '@angular/core/testing';

import { ExportToJustifiTemplateService } from './export-to-justifi-template.service';

describe('ExportToJustifiTemplateService', () => {
  let service: ExportToJustifiTemplateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportToJustifiTemplateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
