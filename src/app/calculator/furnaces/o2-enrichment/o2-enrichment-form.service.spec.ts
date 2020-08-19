import { TestBed } from '@angular/core/testing';

import { O2EnrichmentFormService } from './o2-enrichment-form.service';

describe('O2EnrichmentFormService', () => {
  let service: O2EnrichmentFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(O2EnrichmentFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
