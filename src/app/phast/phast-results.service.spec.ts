import { TestBed, inject } from '@angular/core/testing';

import { PhastResultsService } from './phast-results.service';

describe('PhastResultsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PhastResultsService]
    });
  });

  it('should be created', inject([PhastResultsService], (service: PhastResultsService) => {
    expect(service).toBeTruthy();
  }));
});
