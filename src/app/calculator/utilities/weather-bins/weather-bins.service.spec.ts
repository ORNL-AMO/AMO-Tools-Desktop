import { TestBed } from '@angular/core/testing';

import { WeatherBinsService } from './weather-bins.service';

describe('WeatherBinsService', () => {
  let service: WeatherBinsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WeatherBinsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
