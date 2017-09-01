import { TestBed, inject } from '@angular/core/testing';

import { OpeningLossesService } from './opening-losses.service';

describe('OpeningLossesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OpeningLossesService]
    });
  });

  it('should ...', inject([OpeningLossesService], (service: OpeningLossesService) => {
    expect(service).toBeTruthy();
  }));
});
