import { TestBed, inject } from '@angular/core/testing';

import { SsmtService } from './ssmt.service';

describe('SsmtService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SsmtService]
    });
  });

  it('should be created', inject([SsmtService], (service: SsmtService) => {
    expect(service).toBeTruthy();
  }));
});
