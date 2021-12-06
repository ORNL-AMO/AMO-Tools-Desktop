import { TestBed } from '@angular/core/testing';

import { ReduceAirLeaksService } from './reduce-air-leaks.service';

describe('ReduceAirLeaksService', () => {
  let service: ReduceAirLeaksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReduceAirLeaksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
