import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { WeatherDataIdbService } from '../../../indexedDb/weather-data-idb.service';
import { CsvImportData } from '../../../shared/helper-services/csv-to-json.service';
import { WeatherBinsInput, WeatherBinsService } from './weather-bins.service';

@Injectable()
export class WeatherDbService {
  previousDataAvailable: BehaviorSubject<Date>;
  weatherDataDbData: Array<WeatherDataDbData>;
  constructor(
    private weatherDataIdbService: WeatherDataIdbService, private weatherBinsService: WeatherBinsService) {
    this.previousDataAvailable = new BehaviorSubject<Date>(undefined);
   }

  async initWeatherData() {
    let weatherDataDbData: Array<WeatherDataDbData> = await firstValueFrom(this.weatherDataIdbService.getAllWeatherData());
    if (weatherDataDbData.length == 0) {
      this.addWeatherDataToDb();
    } else {
      this.weatherDataDbData = weatherDataDbData;
      if (this.weatherDataDbData[0].filename !== undefined) {
        this.previousDataAvailable.next(weatherDataDbData[0].modifiedDate);
      }
    }
  }

  async addWeatherDataToDb() {
    let weatherDataDbData: WeatherDataDbData = {
      name: 'Latest',
      modifiedDate: new Date(),
      filename: undefined,
      setupData: {
        individualDataFromCsv: undefined,
      },
    }
    await firstValueFrom(this.weatherDataIdbService.addWithObservable(weatherDataDbData));
  }

  setFromPreviousData() {
    let weatherDataDbData: WeatherDataDbData = this.weatherDataDbData[0];
    let inputData: WeatherBinsInput = this.weatherBinsService.inputData.getValue();
    inputData.fileName = weatherDataDbData.filename;
    this.weatherBinsService.inputData.next(inputData);
    this.weatherBinsService.importDataFromCsv.next(weatherDataDbData.setupData.individualDataFromCsv[0]);
  }

 async saveData() {
    let weatherData = this.weatherBinsService.importDataFromCsv.getValue();
    if (weatherData) {
      let currentInputData = this.weatherBinsService.inputData.getValue();
      let weatherDataDbData: WeatherDataDbData = {
        id: 1,
        name: 'Latest',
        filename: currentInputData.fileName,
        modifiedDate: new Date(),
        setupData: {
          individualDataFromCsv: [weatherData],
        },
      }
      debugger;
      await firstValueFrom(this.weatherDataIdbService.updateWithObservable(weatherDataDbData));
    }
  }

}

export interface WeatherDataDbData {
  id?: number,
  name: string,
  modifiedDate: Date,
  filename?: string,
  setupData: {
      individualDataFromCsv: Array<CsvImportData>,
  }
}