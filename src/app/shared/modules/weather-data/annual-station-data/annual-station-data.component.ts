import { Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { WeatherApiService, WeatherDataPoint, WeatherDataResponse, WeatherStation } from '../../../weather-api.service';
import { firstValueFrom } from 'rxjs';
import { ModalDialogService } from '../../../modal-dialog.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmActionComponent, ConfirmActionData } from '../../../../process-cooling-assessment/confirm-action/confirm-action.component';

@Component({
  selector: 'app-annual-station-data',
  templateUrl: './annual-station-data.component.html',
  styleUrls: ['./annual-station-data.component.css'],
  standalone: false
})
export class AnnualStationDataComponent {
  private modalDialogService: ModalDialogService = inject(ModalDialogService);
  private weatherApiService: WeatherApiService = inject(WeatherApiService);
  private router: Router = inject(Router);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  weatherStation: WeatherStation;
  stationWeatherData: WeatherDataPoint[];
  selectedDataset: string;
  selectedYear: number;
  years: Array<number> = [];

  calculating: boolean;
  hasGapsInData: boolean;

  ngOnInit() {
    const weatherData = { ...this.weatherApiService.getWeatherData() };
    this.weatherStation = weatherData.selectedStation;

    if (!this.weatherStation) {
      this.goToStations();
    } else {

      if (weatherData.weatherDataPoints?.length > 0) {
        this.selectedDataset = `${weatherData.selectedStation.name} - TMY3 Year`;
        this.stationWeatherData = weatherData.weatherDataPoints;
      } else {
        // * not currently used, will use in the future for calendarizaed data
        // if (!this.weatherStation?.isTMYData) {
        //   this.setYears();
        // } else {
        //   this.selectedYear = this.weatherApiService.getTMYYear();
        // }
        this.selectedYear = this.weatherApiService.getTMYYear();
        this.setWeatherData();
      }
    }

    this.modalDialogService.closedResult.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((removeDataset: string) => {
      if (removeDataset) {
        this.weatherApiService.resetWeatherData();
        this.goToStations();
      }
    });
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

  async useDataset() {
    let updatedData = { ...this.weatherApiService.getWeatherData() };
    updatedData.selectedStation = this.weatherStation;
    updatedData.weatherDataPoints = this.stationWeatherData;
    this.selectedDataset = this.weatherStation.name;
    this.weatherApiService.setWeatherData(updatedData);
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


  goToStations() {
    this.router.navigate(['../stations'], { relativeTo: this.activatedRoute });
  }

  selectNewDataset() {
    if (this.selectedDataset) {
      this.modalDialogService.openModal<ConfirmActionComponent, ConfirmActionData>(
        ConfirmActionComponent,
        {
          width: '800px',
          data: {
            modalTitle: 'Select New Weather Dataset',
            confirmMessage: `This action will remove '${this.selectedDataset}' as your active weather dataset and return you to the Weather Station Search. Continue?`,
            resourceId: this.selectedDataset,
            actionName: 'Select New Dataset'
          },
        },
      );
    } else {
      this.goToStations();
    }
  }
}


export interface AnnualStationDataSummary { date: Date, heatingDegreeDays: number, coolingDegreeDays: number, hasErrors: boolean, relativeHumidity: number, dryBulbTemp: number }