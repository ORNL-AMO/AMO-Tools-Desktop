import { TestBed, inject } from '@angular/core/testing';

import { O2EnrichmentService } from './o2-enrichment.service';

describe('O2EnrichmentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [O2EnrichmentService]
    });
  });

  it('should be created', inject([O2EnrichmentService], (service: O2EnrichmentService) => {
    expect(service).toBeTruthy();
  }));
});
