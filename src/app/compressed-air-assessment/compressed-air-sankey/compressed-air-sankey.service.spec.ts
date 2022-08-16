import { TestBed } from '@angular/core/testing';

import { CompressedAirSankeyService } from './compressed-air-sankey.service';

describe('CompressedAirSankeyService', () => {
  let service: CompressedAirSankeyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompressedAirSankeyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
