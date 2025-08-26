import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, forkJoin } from 'rxjs';
import { catchError, retry, timeout, switchMap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class WeatherApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.measurWeatherApi;

  private readonly DATA_URL = `${this.baseUrl}/data`;
  private readonly STATIONS_URL = `${this.baseUrl}/stations`;
  private readonly defaultTimeout = 30000;
  private readonly maxRetries = 2;

  private readonly defaultHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });

  /**
   * Get weather data for a specific station (POST to api/data)
   * @returns Observable<WeatherDataResponse>
   */
  getStationWeatherData(request: WeatherDataRequest): Observable<WeatherDataResponse> {
    return this.http.post<WeatherDataResponse>(this.DATA_URL, request, {
      headers: this.defaultHeaders
    }).pipe(
      timeout(this.defaultTimeout),
      retry(this.maxRetries),
      catchError(this.handleError)
    );
  }

  /**
   * Search for weather stations near a ZIP code (POST to api/stations)
   * @returns Observable<StationSearchResponse>
   */
  searchStations(request: StationSearchRequest): Observable<StationSearchResponse> {
    return this.http.post<StationSearchResponse>(this.STATIONS_URL, request, {
      headers: this.defaultHeaders
    }).pipe(
      timeout(this.defaultTimeout),
      retry(this.maxRetries),
      //   this.appErrorService.handleHttpError(error, 'getCSV')
      catchError(this.handleError)
    );
  }


  /**
   * Find stations and get their weather data
   * @param radialDistance - Search radius in miles
   * @param parameters - Weather parameters to retrieve
   * @param cumulative - optional -  period - default is hourly
   * @returns Observable with stations and their weather data
   */
  getStationsWithWeatherData(
    zip: string,
    radialDistance: number,
    startDate: string,
    endDate: string,
    parameters: WeatherParameter[],
    cumulative?: CumulativePeriod
  ): Observable<{ stations: WeatherStation[], weatherData: WeatherDataResponse[] }> {

    return this.searchStations({
      zip,
      radial_distance: radialDistance,
      start_date: startDate,
      end_date: endDate
    }).pipe(
      switchMap(stationResponse => {
        const weatherRequests: Observable<WeatherDataResponse>[] = stationResponse.stations.map(station => {
          const body: WeatherDataRequest = {
            station_id: station.station_id,
            start_date: startDate,
            end_date: endDate,
            parameters,
            cumulative
          };
          return this.getStationWeatherData(body);
        });

        return forkJoin(weatherRequests).pipe(
          map(weatherData => ({
            stations: stationResponse.stations,
            weatherData
          }))
        );
      }),
      catchError(this.handleError)
    );
  }

  /**
   * @param error - HTTP error response
   * @returns Observable<never>
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'An unexpected error occurred';
    let errorCode = 'UNKNOWN_ERROR';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
      errorCode = 'CLIENT_ERROR';
    } else {
      switch (error.status) {
        case 400:
          errorMessage = 'Bad Request - Please check your parameters';
          errorCode = 'BAD_REQUEST';
          break;
        case 401:
          errorMessage = 'Unauthorized - Invalid API key or authentication';
          errorCode = 'UNAUTHORIZED';
          break;
        case 403:
          errorMessage = 'Forbidden - Access denied';
          errorCode = 'FORBIDDEN';
          break;
        case 404:
          errorMessage = 'Weather data not found for the specified location';
          errorCode = 'NOT_FOUND';
          break;
        case 500:
          errorMessage = 'Internal server error - Please try again later';
          errorCode = 'SERVER_ERROR';
          break;
        default:
          errorMessage = `Server Error: ${error.status} - ${error.message}`;
          errorCode = 'SERVER_ERROR';
      }
    }

    const apiError: WeatherApiError = {
      message: errorMessage,
      code: errorCode,
      timestamp: new Date().toISOString()
    };

    console.error('Weather API Error:', apiError);
    return throwError(() => apiError);
  };

}


export interface WeatherDataRequest {
  station_id: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  parameters: WeatherParameter[];
  cumulative: CumulativePeriod;
}

export type CumulativePeriod = 'hour' | 'day' | 'month' | 'year';

export type WeatherParameter =
  | 'dry_bulb_temp'
  | 'humidity'
  | 'wind_speed'
  | 'wind_direction'
  | 'precipitation'
  | 'pressure'
  | 'visibility'
  | 'dew_point';

export interface WeatherDataResponse {
  hourly_data: WeatherDataPoint[];
}

export interface WeatherDataPoint {
  time: string; // YYYY-MM-DD
  dew_point_temp?: number;
  dry_bulb_temp?: number;
  wet_bulb_temp?: number;
  humidity?: number;
  pressure?: number;
  precipitation?: number;
  wind_speed?: number;
}


export interface WeatherStation {
  station_id: string;
  name: string;
  data_begin_date: string;
  data_end_date: string;
  distance?: number;
  lat: number;
  long: number;
  country?: string;
  state?: string;
  rating_percent: number;
  is_tmy_data: false;
  selected?: boolean; // MEASUR prop only
}

export interface StationSearchRequest {
  zip: string;
  radial_distance: number; // Distance in miles
  start_date: string;      // YYYY-MM-DD
  end_date: string;        // YYYY-MM-DD
  country?: string;
}

export interface StationSearchResponse {
  stations: WeatherStation[];
}

export interface WeatherApiError {
  message: string;
  code: string;
  timestamp: string;
}