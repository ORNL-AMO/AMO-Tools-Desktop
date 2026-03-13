import { TestBed } from '@angular/core/testing';

import { ExportOpportunitiesService } from './export-opportunities.service';

describe('ExportOpportunitiesService', () => {
  let service: ExportOpportunitiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportOpportunitiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
