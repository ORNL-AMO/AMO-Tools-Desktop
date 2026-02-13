
import { InjectionToken } from '@angular/core';
import { WeatherStation, WeatherDataPoint } from '../../weather-api.service';
import { Observable } from 'rxjs';
import { Settings } from '../../models/settings';

export interface WeatherContext {
  readonly weatherContextData$: Observable<WeatherContextData>;
  getWeatherData(): WeatherContextData;
  setWeatherData(data: WeatherContextData): void;
  isValidWeatherData(): boolean;
  getInvalidStatusMessage(): string;
  finishedRoute(): string;
  settings: Settings;
}

export const WEATHER_CONTEXT = new InjectionToken<WeatherContext>('WeatherContext');

export interface WeatherContextData {
    addressString: string;
    selectedStation: WeatherStation | null;
    weatherDataPoints: WeatherDataPoint[];
}