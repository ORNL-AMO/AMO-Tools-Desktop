import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { CsvImportData } from '../../../shared/helper-services/csv-to-json.service';
import { WeatherBinsInput, WeatherBinsService } from './weather-bins.service';

@Injectable()
export class WeatherDbService {

  previousDataAvailable: BehaviorSubject<Date>;
  weatherDataDbData: Array<WeatherDataDbData>;
  constructor(private indexedDbService: IndexedDbService, private weatherBinsService: WeatherBinsService) {
    this.previousDataAvailable = new BehaviorSubject<Date>(undefined);
   }

  initWeatherData() {
      this.indexedDbService.getAllWeatherData().then((weatherDataDbData: Array<WeatherDataDbData>) => {
        if (weatherDataDbData.length == 0) {
          this.addWeatherDataToDb();
        } else {
          this.weatherDataDbData = weatherDataDbData;
          this.previousDataAvailable.next(weatherDataDbData[0].modifiedDate);      
      } if(this.weatherDataDbData[0].filename){
        this.previousDataAvailable.next(weatherDataDbData[0].modifiedDate);
      }
      })
  }

  addWeatherDataToDb() {
    let weatherDataDbData: WeatherDataDbData = {
      name: 'Latest',
      modifiedDate: new Date(),
      filename: undefined,
      setupData: {
        individualDataFromCsv: undefined,
      },
    }
    this.indexedDbService.addWeatherData(weatherDataDbData);
  }

  setFromPreviousData() {
    let weatherDataDbData: WeatherDataDbData = this.weatherDataDbData[0];
    let inputData: WeatherBinsInput = this.weatherBinsService.inputData.getValue();
    inputData.fileName = weatherDataDbData.filename;
    this.weatherBinsService.inputData.next(inputData);
    this.weatherBinsService.importDataFromCsv.next(weatherDataDbData.setupData.individualDataFromCsv[0]);
  }

  saveData() {
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
      this.indexedDbService.putWeatherData(weatherDataDbData);
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