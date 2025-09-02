import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, timeout, map, filter } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { WEATHER_CONTEXT, WeatherContextData } from './modules/weather-data/weather-context.token';


@Injectable()
export class WeatherApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.measurWeatherApi;
  private readonly weatherContextService = inject(WEATHER_CONTEXT);

  private readonly DATA_URL = `${this.baseUrl}/data`;
  private readonly STATIONS_URL = `${this.baseUrl}/stations`;
  private readonly defaultTimeout = 30000;
  private readonly maxRetries = 2;

  private readonly defaultHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });


  /**
   * Set the weather data context on injected service for use elsewhere in the app
   * @param data - The weather context data
   */
  setWeatherData(data: WeatherContextData): void {
    if (this.weatherContextService) {
      this.weatherContextService.setWeatherData(data);
    } else {
      throw new Error('Weather context service not available');
    }
  }

  getWeatherData(): WeatherContextData | undefined {
    if (this.weatherContextService) {
      return this.weatherContextService.getWeatherData();
    } else {
      throw new Error('Weather context service not available');
    }
  }

  getFinishedRoute(): string {
    if (this.weatherContextService) {
      return this.weatherContextService.finishedRoute();
    } else {
      throw new Error('Weather context service not available');
    }
  }

  /**
   * Get hourly weather data for a specific station (POST to api/data)
   * @returns Observable<WeatherDataResponse>
   */
  getStationWeatherData(stationId: string, startDate: Date, endDate: Date): Observable<WeatherDataResponse> {
   const stationDataRequest: WeatherDataRequest = {
    station_id: stationId,
    start_date: this.getWeatherDataDate(startDate),
    end_date: this.getWeatherDataDate(endDate),
    parameters: ['dry_bulb_temp', 'wet_bulb_temp'],
    cumulative: undefined
  };

    return this.http.post<WeatherDataResponse>(this.DATA_URL, stationDataRequest, {
      headers: this.defaultHeaders
    }).pipe(
      timeout(this.defaultTimeout),
      retry(this.maxRetries),
      catchError(this.handleError)
    );
  }

  /**
   * Search for weather stations by ZIP code or LAT/LONG (POST to api/stations)
   * @returns Observable<StationSearchResponse>
   */
  searchStations(request: StationSearchRequest): Observable<WeatherStation[]> {
    return this.http.post<StationSearchResponse>(this.STATIONS_URL, request, {
      headers: this.defaultHeaders
    }).pipe(
      map(response => {
        // * filter out non-TMY stations until we do algorithmic replacement on missing data
        const stations = response.stations.filter(station => station.is_tmy_data);
        return this.mapWeatherStationsRequest({ ...response, stations });
      }),
      timeout(this.defaultTimeout),
      retry(this.maxRetries),
      catchError(this.handleError)
    );
  }

    // todo move to WeatherApiService
  getLocation(addressString: string): Observable<Array<NominatimLocation>> {
    const qp = encodeURIComponent(addressString);
    let url = `https://nominatim.openstreetmap.org/search?q=${qp}&format=json`;
    return this.http.get<Array<NominatimLocation>>(url)
      .pipe(
        map(response => {
          return response.map(loc => ({
            ...loc,
            lat: Number(loc.lat),
            lon: Number(loc.lon)
          }));
        }),
        timeout(this.defaultTimeout),
        retry(this.maxRetries),
        catchError(this.handleError)
      )
  }

  getStationSearchRequest(latitude: number, longitude: number, radial_distance: number): StationSearchRequest {
    const stationSearchRequest: StationSearchRequest = {
      latitude,
      longitude,
      radial_distance,
      start_date: undefined,
      end_date: undefined
    };
    this.setDefaultDates(stationSearchRequest);

    return stationSearchRequest;
  }

  getWeatherDataDate(date: Date): string {
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
  }

  /**
   * The weather API dataset currently hardcodes all TMY station data to year 2000. Current TMY data IS aggregated to 2000
   * @returns The TMY year
   */
  getTMYYear(): number {
    return 2000;
  }
  
    /**
   * Set the date range for requests where range doesn't matter
   * @param request - The station search request
   */
  setDefaultDates(request: StationSearchRequest) {
    const currentDate = new Date();
    request.start_date = "1500-01-01";
    request.end_date = currentDate.getFullYear() + '-' + (currentDate.getMonth() + 1) + '-' + currentDate.getDate();
  }


  mapWeatherStationsRequest(response: StationSearchResponse): WeatherStation[] {
    return response.stations.map(station => ({
      name: station.name,
      lat: station.lat,
      long: station.lon,
      distance: station.distance,
      country: station.country,
      state: station.state,
      stationId: station.station_id,
      beginDate: new Date(station.data_begin_date),
      endDate: new Date(station.data_end_date),
      isTMYData: station.is_tmy_data,
      ratingPercent: station.rating_percent
    }));
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
  start_date: string; 
  end_date: string;  
  parameters: WeatherParameter[];
  cumulative: CumulativePeriod;
}

export type CumulativePeriod = 'hour' | 'day' | 'month' | 'year';

export type WeatherParameter =
  | 'dry_bulb_temp'
  | 'wet_bulb_temp'
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
  stationId: string;
  name: string;
  beginDate: Date;
  endDate: Date;
  distance?: number;
  lat: number;
  long: number;
  country?: string;
  state?: string;
  ratingPercent: number;
  isTMYData: boolean;
  selected?: boolean; // MEASUR prop only
}

/*
  Search by Zip OR lat/long
*/
export interface StationSearchRequest {
  zip?: string;
  latitude?: number;
  longitude?: number;
  radial_distance: number; // Distance in miles
  start_date: string;      // YYYY-MM-DD
  end_date: string;        // YYYY-MM-DD
  country?: string;
}

export interface WeatherStationResponse {
  station_id: string;
  name: string;
  data_begin_date: string;
  data_end_date: string;
  distance?: number;
  lat: number;
  lon: number;
  country?: string;
  state?: string;
  rating_percent: number;
  is_tmy_data: false;
  selected?: boolean; // MEASUR prop only
}

export interface StationSearchResponse {
  stations: WeatherStationResponse[];
}

export interface WeatherApiError {
  message: string;
  code: string;
  timestamp: string;
}

export interface NominatimLocation {
  addresstype: string,
  display_name: string,
  lat: number,
  lon: number,
  place_id: number
}
