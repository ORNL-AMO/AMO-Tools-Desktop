import { TestBed } from '@angular/core/testing';

import { WeatherBinsFormService } from './weather-bins-form.service';

describe('WeatherBinsFormService', () => {
  let service: WeatherBinsFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WeatherBinsFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
