import { TestBed, inject } from '@angular/core/testing';

import { OpportunityPaybackService } from './opportunity-payback.service';

describe('OpportunityPaybackService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OpportunityPaybackService]
    });
  });

  it('should be created', inject([OpportunityPaybackService], (service: OpportunityPaybackService) => {
    expect(service).toBeTruthy();
  }));
});
