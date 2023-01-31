import { HttpClient, HttpErrorResponse, HttpHeaders, JsonpClientBackend } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class WeatherStationLookupService {

  stations: Array<WeatherStation>;
  weatherStationTimeSeriesData: Array<TimeSeriesWeatherData>;
  weatherDataStationName: BehaviorSubject<string>;
  selectedStation: BehaviorSubject<WeatherStation>;
  constructor(private httpClient: HttpClient) {
    this.weatherDataStationName = new BehaviorSubject(undefined);
    this.selectedStation = new BehaviorSubject(undefined);
   }

  getStations(): Observable<Array<WeatherStation>> {
    let url: string = environment.measurUtilitiesApi + 'stations';
    return this.httpClient
      .get<Array<any>>(url, {
      })
      .pipe(
        map(result => result.map((ws) => ({ 
          USAF: ws["USAF"], 
          StationName: ws["Station Name"], 
          Latitude: ws["Latitude"], 
          Longitude: ws["Longitude"], 
          City: ws["City"], 
          State: ws["State"], 
          County: ws["County"], 
          Zip: ws["Zip"] 
      } as WeatherStation))),
      catchError(error => this.handleError(error, 'getStations')));
  }

  getCSV(stationCsvId: number) {
    let url: string = environment.measurUtilitiesApi + 'tmy3s/' + stationCsvId;
    let httpOptions = {
      headers: new HttpHeaders({ 'Accept': 'text, text/csv, application/csv' }),
      // responseType must be cast to use 'text' with get() generic typing
      responseType: 'text' as 'json'
    };
    return this.httpClient
      .get<string>(url, httpOptions)
      .pipe(
        catchError(error => this.handleError(error, 'getCSV')));
  }

  handleError(error: HttpErrorResponse, callOrigin: string) {
    let customError: MeasurHttpError = new MeasurHttpError('An error occured. Please try again');
    if (error.error instanceof ErrorEvent) {
      customError.message = 'An error occured trying to retrieve data from the sercer. Please try again.';
    } else if (error.error instanceof ProgressEvent && error.status === 0) {
      customError.message = 'A network error occured. Please check your internet connection.';
    } 
    return throwError(() => customError);
  }
  
  setWeatherStationTimeSeriesData(csvResults: Array<any>) {
    let weatherStationTimeSeriesData: Array<TimeSeriesWeatherData> = new Array<TimeSeriesWeatherData>();
    csvResults.forEach(result => {
      weatherStationTimeSeriesData.push({
            date: result['Date (MM/DD/YYYY)'],
            time: result['Dew-point (C)'],
            dryBulb: result['Dry-bulb (C)'],
            relativeHumidity: result['RHum (%)'],
            wetBulb: result['Wet Bulb (C)'],
            dewPoint: result['Dew-point (C)'],
            pressure: result['Pressure (mbar)'],
            windDirection: result['Wdir (degrees)'],
            windSpeed: result['Wspd (m/s)'],
            precipitationDepth: result['Lprecip depth (mm)'],
          })
    });
    this.weatherStationTimeSeriesData = weatherStationTimeSeriesData;
  }

  // getUsZipcodes() {
  //   return this.httpClient.get('./us-zipcodes-lat-lon.json');
  // }

  getDistance(userZipLat: number, userZipLong: number, lat2: number, lon2: number): number {
    let R = 6371; // km
    let distanceLat = this.toRad(lat2 - userZipLat);
    let distanceLon = this.toRad(lon2 - userZipLong);
    userZipLat = this.toRad(userZipLat);
    lat2 = this.toRad(lat2);

    let a = Math.sin(distanceLat / 2) * Math.sin(distanceLat / 2) +
      Math.sin(distanceLon / 2) * Math.sin(distanceLon / 2) * Math.cos(userZipLat) * Math.cos(lat2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    // in miles 0.621371 
    let distance = (R * c) * 0.621371;
    return distance;
  }

  toRad(Value) {
    return Value * Math.PI / 180;
  }

}

export interface WeatherStation {
  USAF: number, 
  StationName: string, 
  Latitude: number, 
  Longitude: number, 
  City: string, 
  State: string, 
  County: string, 
  Zip: number,
  distance?: number,
  selected?: boolean
}

export interface TimeSeriesWeatherData {
  date: string,
  time: string,
  dryBulb: number,
  relativeHumidity: number,
  wetBulb: number,
  dewPoint: number,
  pressure: number,
  windDirection: number,
  windSpeed: number,
  precipitationDepth: number
}

export interface ZipGeoData {
  ZIPCODE: string,
  LAT: number,
  LONG: number,
}

// TimeSeriesWeatherData Response object 
// Date (MM/DD/YYYY): "01/05/1982"
// Dew-point (C): -17.2
// Dry-bulb (C): -3.9
// Lprecip depth (mm): 0
// Pressure (mbar): 1017
// RHum (%): 35
// Time (HH:MM): "05:00"
// Wdir (degrees): 170
// Wet Bulb (C): -7
// Wspd (m/s): 1.5

export class MeasurHttpError extends Error  {}