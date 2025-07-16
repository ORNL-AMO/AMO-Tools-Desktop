import { TestBed } from '@angular/core/testing';

import { ProcessCoolingResultsService } from './process-cooling-results.service';

describe('ProcessCoolingResultsService', () => {
  let service: ProcessCoolingResultsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProcessCoolingResultsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
