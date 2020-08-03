import { TestBed } from '@angular/core/testing';

import { SteamPropertiesService } from './steam-properties.service';

describe('SteamPropertiesService', () => {
  let service: SteamPropertiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SteamPropertiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
