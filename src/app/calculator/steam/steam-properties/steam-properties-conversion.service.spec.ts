import { TestBed } from '@angular/core/testing';

import { SteamPropertiesConversionService } from './steam-properties-conversion.service';

describe('SteamPropertiesConversionService', () => {
  let service: SteamPropertiesConversionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SteamPropertiesConversionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
