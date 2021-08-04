import { TestBed } from '@angular/core/testing';

import { StandaloneOpportunitySheetService } from './standalone-opportunity-sheet.service';

describe('StandaloneOpportunitySheetService', () => {
  let service: StandaloneOpportunitySheetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StandaloneOpportunitySheetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
