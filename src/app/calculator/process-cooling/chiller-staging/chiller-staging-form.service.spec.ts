import { TestBed } from '@angular/core/testing';

import { ChillerStagingFormService } from './chiller-staging-form.service';

describe('ChillerStagingFormService', () => {
  let service: ChillerStagingFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChillerStagingFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
