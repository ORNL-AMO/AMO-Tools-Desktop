import { TestBed } from '@angular/core/testing';

import { ConvertCompressedAirService } from './convert-compressed-air.service';

describe('ConvertCompressedAirService', () => {
  let service: ConvertCompressedAirService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConvertCompressedAirService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
