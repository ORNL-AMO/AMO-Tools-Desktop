import { TestBed, inject } from '@angular/core/testing';

import { OpportunitySheetService } from './opportunity-sheet.service';

describe('OpportunitySheetService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OpportunitySheetService]
    });
  });

  it('should be created', inject([OpportunitySheetService], (service: OpportunitySheetService) => {
    expect(service).toBeTruthy();
  }));
});
