import { TestBed, inject } from '@angular/core/testing';

import { TreasureHuntService } from './treasure-hunt.service';

describe('TreasureHuntService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TreasureHuntService]
    });
  });

  it('should be created', inject([TreasureHuntService], (service: TreasureHuntService) => {
    expect(service).toBeTruthy();
  }));
});
