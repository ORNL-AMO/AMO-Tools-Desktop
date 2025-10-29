import { Component, inject } from '@angular/core';
import { WEATHER_CONTEXT } from './weather-context.token';


// * Components in this Module are a direct copy of the same module in VERIFI. 
// * Additional unused/unnecessary code has been removed to simplify the module for MEASUR
// * Upgrades to functionality could also be made in VERIFI - coordinate with rmroot / jamlockim


@Component({
  selector: 'app-weather-data',
  templateUrl: './weather-data.component.html',
  styleUrls: ['./weather-data.component.css'],
  standalone: false
})
export class WeatherDataComponent {
  private readonly weatherContextService = inject(WEATHER_CONTEXT);
  weatherDataInvalidMessage: string;
  isWeatherDataValid: boolean = false;
  
  ngOnInit(): void {
    this.weatherDataInvalidMessage = this.weatherContextService.getInvalidStatusMessage();
    this.isWeatherDataValid = this.weatherContextService.isValidWeatherData();
  }
}


