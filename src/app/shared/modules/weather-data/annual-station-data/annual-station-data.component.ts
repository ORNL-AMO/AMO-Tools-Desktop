import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { WeatherApiService, WeatherDataPoint, WeatherDataResponse, WeatherStation } from '../../../weather-api.service';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-annual-station-data',
    templateUrl: './annual-station-data.component.html',
    styleUrls: ['./annual-station-data.component.css'],
    standalone: false
})
export class AnnualStationDataComponent {

  weatherStation: WeatherStation;
  stationWeatherData: WeatherDataPoint[];
  selectedYear: number;
  years: Array<number> = [];
  
  calculating: boolean;
  hasGapsInData: boolean;
  constructor(private router: Router,
    private weatherApiService: WeatherApiService,
    // private toastNotificationService: ToastNotificationsService,
    private activatedRoute: ActivatedRoute
  ) {

  }

  ngOnInit() {
    const weatherData = {...this.weatherApiService.getWeatherData()};
    this.weatherStation = weatherData.selectedStation;

    if (!this.weatherStation) {
      this.goToStations();
    } else { 
      if (!this.weatherStation?.isTMYData) {
        this.setYears();
      } else {
        this.selectedYear = this.weatherApiService.getTMYYear();
      }
      this.setWeatherData();
    }
  }


  setYears() {
    this.years = new Array();
    let end: Date = new Date(this.weatherStation.endDate);
    while (this.weatherStation.beginDate < end) {
      this.years.push(end.getFullYear());
      end.setFullYear(end.getFullYear() - 1);
    }
    if (!this.selectedYear) {
      this.selectedYear = this.years[0];
    }
  }


  async setWeatherData() {
    this.hasGapsInData = false;
    this.calculating = true;
    let startDate: Date = new Date(this.selectedYear, 0, 1)
    let endDate: Date = new Date(this.selectedYear + 1, 0, 1);

    try {
      const stationWeatherDataResponse: WeatherDataResponse = await firstValueFrom(this.weatherApiService.getStationWeatherData(
        this.weatherStation.stationId,
        startDate,
        endDate
      ));
      if (stationWeatherDataResponse) {
        if (stationWeatherDataResponse.hourly_data.length < 8760) {
          this.hasGapsInData = true;
        }
        this.stationWeatherData = stationWeatherDataResponse.hourly_data;
        console.log('stationWeatherData:', this.stationWeatherData);
      }
    } catch (error) {
      console.error('Error fetching station weather data:', error);
      //   this.toastNotificationService.weatherDataErrorToast();
    }
    this.calculating = false;
  }

  async useDataset() {
    let updatedData = { ...this.weatherApiService.getWeatherData()};
    updatedData.selectedStation = this.weatherStation;
    updatedData.weatherDataPoints = this.stationWeatherData;
    this.weatherApiService.setWeatherData(updatedData);
    this.goToFinishedRoute();
  }

  goToFinishedRoute() {
    const finishedRoute = this.weatherApiService.getFinishedRoute();
    console.log(finishedRoute);
    this.router.navigate([finishedRoute]);
  }

  goToStations() {
    this.router.navigate(['../stations'], { relativeTo: this.activatedRoute });
  }
}


export interface AnnualStationDataSummary { date: Date, heatingDegreeDays: number, coolingDegreeDays: number, hasErrors: boolean, relativeHumidity: number, dryBulbTemp: number }