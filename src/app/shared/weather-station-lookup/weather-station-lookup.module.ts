import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeatherStationLookupComponent } from './weather-station-lookup.component';
import { WeatherStationLookupService } from './weather-station-lookup.service';
import { HttpClientModule } from '@angular/common/http';



@NgModule({
  declarations: [
    WeatherStationLookupComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  exports: [
    WeatherStationLookupComponent
  ],
  providers: [
    WeatherStationLookupService
  ]
})
export class WeatherStationLookupModule { }
