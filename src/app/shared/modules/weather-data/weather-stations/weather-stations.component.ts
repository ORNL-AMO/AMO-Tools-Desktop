import { Component, inject } from '@angular/core';
import { LocationsWithStationsResult, NominatimLocation, WeatherApiService, WeatherStation } from '../../../weather-api.service';
import { WeatherApiServiceMock } from '../weather-api.service.mock';
import { GEO_DATA_STATE_LINES } from '../geo-assets/geo-data-state-lines';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-weather-stations',
  templateUrl: './weather-stations.component.html',
  styleUrls: ['./weather-stations.component.css'],
  standalone: false
})
export class WeatherStationsComponent {
  private weatherApiService: WeatherApiService = inject(WeatherApiService);
  private weatherApiServiceMock: WeatherApiServiceMock = inject(WeatherApiServiceMock);

  useDevelopmentMock: boolean = (environment as any).useMockWeatherApi === true && !environment.production;
  private weatherService: WeatherApiService | WeatherApiServiceMock = this.useDevelopmentMock
      ? this.weatherApiServiceMock
      : this.weatherApiService;

  furthestDistance: number = environment.production ? 50 : 25;
  stations: Array<WeatherStation> = [];

  fetchingData: boolean = false;
  addressString: string;
  addressLatLong: {
    latitude: number,
    longitude: number,
  } = {
      latitude: undefined,
      longitude: undefined,
    };
  listByCountry: boolean = false;

  addressLookupItems: Array<NominatimLocation>;
  locationStations: LocationsWithStationsResult;

  searchingLatLong: boolean = false;
  isLocationSearch: boolean = true;
  selectedLocationId: number;
  stationSearchError: boolean = false;

  maxSearchDistance = this.weatherApiService.MAX_SEARCH_DISTANCE;

  stateLines: any;

  ngOnInit() {
    this.stateLines = GEO_DATA_STATE_LINES;
    const weatherData = { ...this.weatherApiService.getWeatherData() };
    if (weatherData?.addressString) {
      this.addressString = weatherData.addressString;
      this.getLocationAndStations();
    }
    if (weatherData?.selectedStation) {
      this.addressLatLong.latitude = weatherData.selectedStation.lat;
      this.addressLatLong.longitude = weatherData.selectedStation.long;
    }
  }

  // todo for now should only display TMY3 stations
  async getLocationAndStations() {
    this.selectedLocationId = undefined;
    this.searchingLatLong = true;

    if (this.addressString) {
      try {
        this.locationStations = await firstValueFrom(this.weatherService.getLocationsAndStationsTMY(this.addressString, this.furthestDistance));
        this.addressLookupItems = this.locationStations.locations;

        if (this.addressLookupItems?.length > 0) {
          this.addressLookupItems = this.addressLookupItems.sort((a, b) => {
            const aUS = a.display_name.includes('United States') ? 0 : 1;
            const bUS = b.display_name.includes('United States') ? 0 : 1;
            return aUS - bUS;
          });
          this.selectedLocationId = this.addressLookupItems[0].place_id;
          const weatherData = { ...this.weatherApiService.getWeatherData() };
          weatherData.addressString = this.addressString;
          this.weatherApiService.setWeatherData(weatherData);
          this.stations = this.locationStations.stationsByPlaceId[this.selectedLocationId] || [];
        }

        this.searchingLatLong = false;
        this.stationSearchError = false;
      } catch (error) {
        console.error('Error fetching address lookup items:', error);
        this.addressLookupItems = [];
        this.stationSearchError = true;
        this.searchingLatLong = false;
      }
    }
  }

  setLatLongFromItem(item: NominatimLocation) {
    this.addressLatLong = {
      latitude: item.lat,
      longitude: item.lon
    }
    this.clearStations();
  }

  setTMYStations() {
    this.stations = this.locationStations.stationsByPlaceId[this.selectedLocationId] || [];
  }

  async getStationsByLatLong() {
    if (this.addressLatLong.latitude && this.addressLatLong.longitude && this.furthestDistance) {
      this.fetchingData = true;
      this.stationSearchError = false;

      const stationSearchRequest = this.weatherApiService.getStationSearchRequest(
        this.addressLatLong.latitude,
        this.addressLatLong.longitude,
        this.furthestDistance
      );

      try {
        this.stations = await firstValueFrom(this.weatherApiService.searchStations(stationSearchRequest));
        console.log(this.stations);
        this.fetchingData = false;
      } catch (error) {
        console.error('Error fetching weather stations:', error);
        this.stationSearchError = true;
        this.clearStations();
        this.fetchingData = false;
      }
    } else {
      this.fetchingData = false;
      this.clearStations();
    }
  }


  clearStations() {
    this.addressLookupItems = [];
    this.stations = [];
  }

}
