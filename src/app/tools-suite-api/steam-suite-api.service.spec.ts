import { TestBed } from '@angular/core/testing';

import { SteamSuiteApiService } from './steam-suite-api.service';

describe('SteamSuiteApiService', () => {
  let service: SteamSuiteApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SteamSuiteApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
