import { TestBed, inject } from '@angular/core/testing';

import { ReportGraphsService } from './report-graphs.service';

describe('ReportGraphsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReportGraphsService]
    });
  });

  it('should be created', inject([ReportGraphsService], (service: ReportGraphsService) => {
    expect(service).toBeTruthy();
  }));
});
