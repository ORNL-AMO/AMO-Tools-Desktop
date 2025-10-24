import { TestBed } from '@angular/core/testing';

import { CompressedAirBasicsService } from './compressed-air-basics.service';

describe('CompressedAirBasicsService', () => {
  let service: CompressedAirBasicsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompressedAirBasicsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
