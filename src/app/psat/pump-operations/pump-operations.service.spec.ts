import { TestBed } from '@angular/core/testing';

import { PumpOperationsService } from './pump-operations.service';

describe('PumpOperationsService', () => {
  let service: PumpOperationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PumpOperationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
