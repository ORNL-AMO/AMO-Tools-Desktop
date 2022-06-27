import { TestBed } from '@angular/core/testing';

import { WeatherDbService } from './weather-db.service';

describe('WeatherDbService', () => {
  let service: WeatherDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WeatherDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
