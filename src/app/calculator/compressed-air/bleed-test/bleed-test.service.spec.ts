import { TestBed } from '@angular/core/testing';

import { BleedTestService } from './bleed-test.service';

describe('BleedTestService', () => {
  let service: BleedTestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BleedTestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
