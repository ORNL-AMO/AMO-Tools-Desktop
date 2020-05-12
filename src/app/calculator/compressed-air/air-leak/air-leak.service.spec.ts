import { TestBed } from '@angular/core/testing';

import { AirLeakService } from './air-leak.service';

describe('AirLeakService', () => {
  let service: AirLeakService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AirLeakService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
