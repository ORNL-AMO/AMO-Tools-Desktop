import { TestBed } from '@angular/core/testing';

import { SteamReductionService } from './steam-reduction.service';

describe('SteamReductionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SteamReductionService = TestBed.get(SteamReductionService);
    expect(service).toBeTruthy();
  });
});
