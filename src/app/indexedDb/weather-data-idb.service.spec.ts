import { TestBed } from '@angular/core/testing';

import { WeatherDataIdbService } from './weather-data-idb.service';

describe('WeatherDataIdbService', () => {
  let service: WeatherDataIdbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WeatherDataIdbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
