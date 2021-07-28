import { TestBed } from '@angular/core/testing';

import { FullLoadAmpsService } from './full-load-amps.service';

describe('FullLoadAmpsService', () => {
  let service: FullLoadAmpsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FullLoadAmpsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
