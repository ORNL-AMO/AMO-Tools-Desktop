import { TestBed } from '@angular/core/testing';

import { ConvertSteamService } from './convert-steam.service';

describe('ConvertSteamService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ConvertSteamService = TestBed.get(ConvertSteamService);
    expect(service).toBeTruthy();
  });
});
