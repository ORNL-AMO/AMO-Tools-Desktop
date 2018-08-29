import { TestBed, inject } from '@angular/core/testing';

import { CompressedAirService } from './compressed-air.service';

describe('CompressedAirService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CompressedAirService]
    });
  });

  it('should be created', inject([CompressedAirService], (service: CompressedAirService) => {
    expect(service).toBeTruthy();
  }));
});
