import { TestBed } from '@angular/core/testing';

import { ConvertAirLeakService } from './convert-air-leak.service';

describe('ConvertAirLeakService', () => {
  let service: ConvertAirLeakService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConvertAirLeakService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
