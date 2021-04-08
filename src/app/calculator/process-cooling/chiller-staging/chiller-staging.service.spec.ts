import { TestBed } from '@angular/core/testing';

import { ChillerStagingService } from './chiller-staging.service';

describe('ChillerStagingService', () => {
  let service: ChillerStagingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChillerStagingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
