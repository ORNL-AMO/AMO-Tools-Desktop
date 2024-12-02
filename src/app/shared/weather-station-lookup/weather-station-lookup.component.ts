import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { WeatherStation, WeatherStationLookupService } from './weather-station-lookup.service';
import * as Papa from 'papaparse';
import { CsvImportData } from '../helper-services/csv-to-json.service';
import { WeatherBinsService, WeatherDataSourceView,  } from '../../calculator/utilities/weather-bins/weather-bins.service';
import * as _ from 'lodash';
import US_ZIPCODES from '../../../assets/us-zipcodes-lat-lon.json';
import { ConvertUnitsService } from '../convert-units/convert-units.service';
import { Subscription } from 'rxjs';
import { MeasurHttpError } from '../errors/errors';

@Component({
  selector: 'app-weather-station-lookup',
  templateUrl: './weather-station-lookup.component.html',
  styleUrls: ['./weather-station-lookup.component.css']
})
export class WeatherStationLookupComponent implements OnInit {
  zipcode: string;
  hasZipcodeNotFoundError: boolean = false;
  resultCount: number = 5;
  weatherDataSourceView: WeatherDataSourceView;
  weatherLookupError: Error;
  
  selectedStation: WeatherStation;
  nearestStations: Array<WeatherStation>;
  allStationsOrdered: Array<WeatherStation>;

  weatherDataSourceSubscription: Subscription;
  selectedStationSubscription: Subscription;
  importDataFromCSVSubscription: Subscription;
  
  constructor(private weatherStationLookupService: WeatherStationLookupService, 
    private convertUnitsService: ConvertUnitsService, private weatherBinsService: WeatherBinsService) { }

  ngOnInit(): void {
    this.getStationsList();
    this.weatherDataSourceSubscription = this.weatherBinsService.weatherDataSourceView.subscribe(view => {
      this.weatherDataSourceView = view;
    });

    this.selectedStationSubscription = this.weatherStationLookupService.selectedStation.subscribe(selectedStation => {
      this.selectedStation = selectedStation;
    });

    this.importDataFromCSVSubscription = this.weatherBinsService.importDataFromCsv.subscribe(data => {
      if (data && this.weatherDataSourceView !== 'lookup') {
        this.resetLookupData();
      }
    });
  }

  getStationsList() {
    this.weatherLookupError = undefined;
    this.weatherStationLookupService.getStations().subscribe({
      next: (stations: WeatherStation[]) => {
        this.weatherStationLookupService.stations = stations
      },
      error: (error: MeasurHttpError) => {
        // Ignore connectivity error if the user has already assigned data
        if (!this.weatherBinsService.importDataFromCsv.getValue() && this.weatherDataSourceView == 'lookup') {
          this.weatherLookupError = error;
        }
      }
    });
  }

  ngOnDestroy() {
    this.weatherDataSourceSubscription.unsubscribe();
    this.selectedStationSubscription.unsubscribe();
    this.importDataFromCSVSubscription.unsubscribe();
  }

  setSelectedStation(weatherStation: WeatherStation) {
    this.nearestStations.forEach(station => {
      if (station.USAF === weatherStation.USAF) {
        station.selected = true;
      } else {
        station.selected = false;
      }
    }
    );
    this.weatherStationLookupService.selectedStation.next(weatherStation);
    this.applyStationWeatherData(weatherStation);
  }

  applyStationWeatherData(weatherStation: WeatherStation) {
    this.weatherLookupError = undefined;
    this.weatherStationLookupService.getCSV(weatherStation.USAF).subscribe({
      next: csvString => {
        let stationCSVWeatherData: CsvImportData = Papa.parse(csvString, {
          header: true,
          dynamicTyping: true
        });
        this.weatherBinsService.importDataFromCsv.next(stationCSVWeatherData);
      },
      error: (error: MeasurHttpError) => {
        // Ignore connectivity error if the user has already assigned data
        if (!this.weatherBinsService.importDataFromCsv.getValue() && this.weatherDataSourceView == 'lookup') {
          this.weatherLookupError = error
        }
      }
    });
    if (this.weatherBinsService.importDataFromCsv.getValue()) {
      this.weatherBinsService.resetBinCaseData();
    }
  }

  setStations() {
    if (!this.weatherStationLookupService.stations) {
      this.getStationsList();
    }
    this.hasZipcodeNotFoundError = false;
    let allWeatherStations: Array<WeatherStation> = [];
    let USZipGeoData = US_ZIPCODES;
    let userZipMatchedGeoData: { ZIPCODE: string, LAT: number, LONG: number };

    USZipGeoData.forEach(zipData => {
      if (this.zipcode === String(zipData.ZIPCODE)) {
        userZipMatchedGeoData = zipData;
      }
    });

    if (userZipMatchedGeoData) {
      this.weatherStationLookupService.stations.forEach(station => {
        let distanceFromUser: number = this.weatherStationLookupService.getDistance(userZipMatchedGeoData.LAT, userZipMatchedGeoData.LONG, station.Latitude, station.Longitude);
        station.distance = this.convertUnitsService.roundVal(distanceFromUser, 1);
        allWeatherStations.push(station);
      });
    } else {
      this.hasZipcodeNotFoundError = true;
    }

    this.allStationsOrdered = _.orderBy(allWeatherStations, ['distance'],['asc']);
    this.setNearestStations();
  }

  setNearestStations() {
    if (this.allStationsOrdered) {
      this.nearestStations = JSON.parse(JSON.stringify(this.allStationsOrdered)).slice(0, this.resultCount);
    }
  }

  resetWeatherData(hasWeatherLookupError?: Error) {
    if (hasWeatherLookupError) {
      this.getStationsList();
    }
    this.weatherBinsService.resetBinCaseData();
    this.resetLookupData();
  }

  resetLookupData() {
    this.weatherStationLookupService.selectedStation.next(undefined);
    this.allStationsOrdered = undefined;
    this.nearestStations = undefined;
    this.resultCount = 5;
    this.hasZipcodeNotFoundError = undefined;
    this.weatherLookupError = undefined;
    this.zipcode = undefined;
  }

  focusField(str: string) {
    this.weatherBinsService.currentField.next(str);
  }

}
