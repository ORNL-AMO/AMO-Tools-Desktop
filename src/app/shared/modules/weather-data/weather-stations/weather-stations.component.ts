import { Component } from '@angular/core';
import { NominatimLocation, StationSearchRequest, WeatherApiService, WeatherStation } from '../../../weather-api.service';
import { GEO_DATA_STATE_LINES } from '../geo-assets/geo-data-state-lines';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-weather-stations',
    templateUrl: './weather-stations.component.html',
    styleUrls: ['./weather-stations.component.css'],
    standalone: false
})
export class WeatherStationsComponent {

  furthestDistance: number = 70;
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

  addressLookupItems: Array<NominatimLocation> = [];
  searchingLatLong: boolean = false;
  isLocationSearch: boolean = true;
  selectedLocationId: number;
  stationSearchError: boolean = false;

  stateLines: any;
  constructor(
    private weatherApiService: WeatherApiService
  ) {}

  ngOnInit() {
    this.stateLines = GEO_DATA_STATE_LINES;
    const weatherData = {...this.weatherApiService.getWeatherData()};

    if(weatherData?.addressString){
      this.addressString = weatherData.addressString;
      this.searchLatLong();
    }
    if (weatherData?.selectedStation) {
      this.addressLatLong.latitude = weatherData.selectedStation.lat;
      this.addressLatLong.longitude = weatherData.selectedStation.long;
    }
  }

  async searchLatLong() {
    this.selectedLocationId = undefined;
    this.searchingLatLong = true;

    if (this.addressString) {
      try {
        // todo remove - testing
        // const testitem = {
        //     "name": "MINNEAPOLIS-ST PAUL INTERNATIONAL AP",
        //     "lat": 44.885,
        //     "long": -93.231,
        //     "distance": 8.11,
        //     "country": "US",
        //     "state": "MN",
        //     "stationId": "72658014922",
        //     "beginDate": "2010-01-01T00:00:00.000Z",
        //     "endDate": "2025-08-25T00:00:00.000Z",
        //     "isTMYData": false,
        //     "ratingPercent": 99.8
        //   };

        //   this.selectedLocationId = Number(testitem.stationId)
        //   this.addressLatLong = {
        //     latitude: testitem.lat,
        //     longitude: testitem.long
        //   };

        //   const weatherData = {...this.weatherApiService.getWeatherData()};
        //   weatherData.addressString = this.addressString;
        //   this.weatherApiService.setWeatherData(weatherData);

        this.addressLookupItems = await firstValueFrom(this.weatherApiService.getLocation(this.addressString));
        if (this.addressLookupItems?.length > 0) {
          this.addressLookupItems = this.addressLookupItems.sort((a, b) => {
            const aUS = a.display_name.includes('United States') ? 0 : 1;
            const bUS = b.display_name.includes('United States') ? 0 : 1;
            return aUS - bUS;
          });
         this.selectedLocationId = this.addressLookupItems[0].place_id
          this.setLatLongFromItem(this.addressLookupItems[0]);
          const weatherData = {...this.weatherApiService.getWeatherData()};
          weatherData.addressString = this.addressString;
          this.weatherApiService.setWeatherData(weatherData);
        }

        this.searchingLatLong = false;
        this.stationSearchError = false;
      } catch (error) {
        console.error('Error fetching address lookup items:', error);
        this.addressLookupItems = [];
        this.stationSearchError = true;
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

     async setStations() {
    if (this.addressLatLong.latitude && this.addressLatLong.longitude && this.furthestDistance) {
      this.fetchingData = true;
      this.stationSearchError = false;

      const stationSearchRequest = this.weatherApiService.getStationSearchRequest(
        this.addressLatLong.latitude,
        this.addressLatLong.longitude,
        this.furthestDistance
      );

      // this.stations = testingStations
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
    this.stations = [];
  }

}


// const testingStations: WeatherStation[] =
//   [
//     {
//       "name": "HINCKLEY/FIELD OF DREAMS AIRPORT",
//       "lat": 46.023,
//       "long": -92.895,
//       "distance": 74.74,
//       "country": "US",
//       "state": "MN",
//       "stationId": "72065799999",
//       "beginDate": new Date("2010-01-01"),
//       "endDate": new Date("2013-04-30"),
//       "isTMYData": false,
//       "ratingPercent": 14.32
//     },
//     {
//       "name": "MINNEAPOLIS-ST PAUL INTERNATIONAL AP",
//       "lat": 44.885,
//       "long": -93.231,
//       "distance": 8.11,
//       "country": "US",
//       "state": "MN",
//       "stationId": "72658014922",
//       "beginDate": new Date("2010-01-01"),
//       "endDate": new Date("2025-08-25"),
//       "isTMYData": false,
//       "ratingPercent": 99.8
//     },
//     {
//       "name": "MINNEAPOLIS-ST PAUL INT'L ARP",
//       "lat": 44.882531,
//       "long": -93.231909,
//       "distance": 8.24,
//       "country": "US",
//       "state": "MN",
//       "stationId": "72658000000",
//       "beginDate": new Date("1500-01-01"),
//       "endDate": new Date("2000-12-31"),
//       "isTMYData": true,
//       "ratingPercent": 100
//     }

//   ];


  