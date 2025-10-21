import { TestBed } from '@angular/core/testing';

import { MaxFullFlowCatalogService } from './max-full-flow-catalog.service';

describe('MaxFullFlowCatalogService', () => {
  let service: MaxFullFlowCatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MaxFullFlowCatalogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
