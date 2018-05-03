import { TestBed, inject } from '@angular/core/testing';

import { SteamService } from './steam.service';

describe('SteamService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SteamService]
    });
  });

  it('should be created', inject([SteamService], (service: SteamService) => {
    expect(service).toBeTruthy();
  }));
});
