
import { InjectionToken } from '@angular/core';
import { WeatherStation, WeatherDataPoint } from '../../weather-api.service';
import { Observable } from 'rxjs';

export interface WeatherContext {
  readonly weatherContextData$: Observable<WeatherContextData>;
  getWeatherData(): WeatherContextData;
  setWeatherData(data: WeatherContextData): void;
  isValidWeatherData(): boolean;
  finishedRoute(): string;
}

export const WEATHER_CONTEXT = new InjectionToken<WeatherContext>('WeatherContext');

export interface WeatherContextData {
    addressString: string;
    selectedStation: WeatherStation | null;
    weatherDataPoints: WeatherDataPoint[];
}