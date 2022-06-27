import { TestBed } from '@angular/core/testing';

import { WeatherStationLookupService } from './weather-station-lookup.service';

describe('WeatherStationLookupService', () => {
  let service: WeatherStationLookupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WeatherStationLookupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
