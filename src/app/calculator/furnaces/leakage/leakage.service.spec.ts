import { TestBed } from '@angular/core/testing';

import { LeakageService } from './leakage.service';

describe('LeakageService', () => {
  let service: LeakageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LeakageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
