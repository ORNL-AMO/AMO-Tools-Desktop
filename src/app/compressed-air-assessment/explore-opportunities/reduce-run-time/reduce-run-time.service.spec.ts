import { TestBed } from '@angular/core/testing';

import { ReduceRunTimeService } from './reduce-run-time.service';

describe('ReduceRunTimeService', () => {
  let service: ReduceRunTimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReduceRunTimeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
