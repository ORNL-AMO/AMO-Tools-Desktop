import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { WeatherApiService, WeatherStation } from '../../../weather-api.service';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-annual-station-data',
    templateUrl: './annual-station-data.component.html',
    styleUrls: ['./annual-station-data.component.css'],
    standalone: false
})
export class AnnualStationDataComponent {

  weatherStation: WeatherStation;
  selectedYear: number;
  years: Array<number> = [];
  
  yearSummaryData: Array<AnnualStationDataSummary>;
  calculating: boolean;
  hasGapsInData: boolean;
  constructor(private router: Router,
    private weatherApiService: WeatherApiService,
    // private toastNotificationService: ToastNotificationsService,
    private activatedRoute: ActivatedRoute
  ) {

  }

  ngOnInit() {
    this.weatherStation = this.weatherApiService.selectedStation;
    if (!this.weatherStation) {
      this.goToStations();
    }


    if (this.weatherStation.isTMYData) {
      this.setYears();
    } else {
      this.selectedYear = this.weatherApiService.getTMYYear();
    }

    // todo get data from context, initialize as if just visited 
    // this.selectedYear = this.weatherApiService.selectedYear;
    // this.heatingTemp = this.weatherApiService.heatingTemp;
    // this.coolingTemp = this.weatherApiService.coolingTemp;
    // this.setDegreeDays();
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

  // todo we will actually set weather data from the process cooling api service (or other module service)
  // todo encapsulate input selection, dates, stationId, tmy, etc into process cooling model
  async setWeatherData() {
    this.calculating = true;
    let startDate: Date = new Date(this.selectedYear, 0, 1)
    let endDate: Date = new Date(this.selectedYear + 1, 0, 1);

    console.log('Start Date:', startDate);
    console.log('End Date:', endDate);
    try {
      let stationData = await firstValueFrom(this.weatherApiService.getStationWeatherData(
        this.weatherStation.stationId,
        startDate,
        endDate
      ));
      // todo set data for annual table/graphs
      console.log(stationData);
    } catch (error) {
      console.error('Error fetching station weather data:', error);
      //   this.toastNotificationService.weatherDataErrorToast();
    }
    this.calculating = false;
  }

  useDataset() {
    // todo set context data
  }

  goToStations() {
    this.router.navigate(['../stations'], { relativeTo: this.activatedRoute });
  }
}


export interface AnnualStationDataSummary { date: Date, heatingDegreeDays: number, coolingDegreeDays: number, hasErrors: boolean, relativeHumidity: number, dryBulbTemp: number }