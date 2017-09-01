import { TestBed, inject } from '@angular/core/testing';

import { WallLossesService } from './wall-losses.service';

describe('WallLossesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WallLossesService]
    });
  });

  it('should ...', inject([WallLossesService], (service: WallLossesService) => {
    expect(service).toBeTruthy();
  }));
});
