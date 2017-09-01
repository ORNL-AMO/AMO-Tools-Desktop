import { TestBed, inject } from '@angular/core/testing';

import { SuiteDbService } from './suite-db.service';

describe('SuiteDbService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SuiteDbService]
    });
  });

  it('should be created', inject([SuiteDbService], (service: SuiteDbService) => {
    expect(service).toBeTruthy();
  }));
});
