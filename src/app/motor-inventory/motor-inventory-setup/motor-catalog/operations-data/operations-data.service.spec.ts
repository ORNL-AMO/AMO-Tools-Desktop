import { TestBed } from '@angular/core/testing';

import { OperationsDataService } from './operations-data.service';

describe('OperationsDataService', () => {
  let service: OperationsDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OperationsDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
