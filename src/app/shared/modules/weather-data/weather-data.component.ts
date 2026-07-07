import { Component, DestroyRef, inject } from '@angular/core';
import { WEATHER_CONTEXT } from './weather-context.token';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  private readonly destroyRef = inject(DestroyRef);
  weatherDataInvalidMessage: string;
  isWeatherDataValid: boolean = false;

  weatherContextData = this.weatherContextService.weatherContextData$;
  
  ngOnInit(): void {
    this.weatherContextData.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.weatherDataInvalidMessage = this.weatherContextService.getInvalidStatusMessage();
      this.isWeatherDataValid = this.weatherContextService.isValidWeatherData();
    });
  }
}


