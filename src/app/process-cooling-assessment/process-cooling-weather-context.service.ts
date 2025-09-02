import { inject, Injectable } from '@angular/core';
import { WeatherContext, WeatherContextData } from '../shared/modules/weather-data/weather-context.token';
import { ROUTE_TOKENS } from './process-cooling-assessment.module';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ProcessCoolingWeatherContextService implements WeatherContext {
  private router: Router = inject(Router);
  private readonly weatherContextData = new BehaviorSubject<WeatherContextData>(undefined);
  readonly weatherContextData$ = this.weatherContextData.asObservable();

  getWeatherData() {
    return this.weatherContextData.getValue();
  }

  setWeatherData(data: WeatherContextData) {
    this.weatherContextData.next(data);
  }

  isValidWeatherData(): boolean {
    const weatherContextData = this.weatherContextData.getValue();
    return weatherContextData
      && weatherContextData.selectedStation
      && weatherContextData.weatherDataPoints?.length > 0;
  }

    /*
  * Route to navigate to after weather data is set
  */
  finishedRoute() {
   const token = ROUTE_TOKENS.systemInformation;
   const regex = new RegExp(`(${token})(\\/.*)?$`);

   const currentURL = this.router.url;
   const finishedURL = currentURL.replace(regex, `$1/${ROUTE_TOKENS.waterPump}`);
   return finishedURL;
  }
}
