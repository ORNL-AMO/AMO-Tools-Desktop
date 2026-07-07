import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { LocationsWithStationsResult, NominatimLocation, WeatherStation } from '../../weather-api.service';

@Injectable()
export class WeatherApiServiceMock {

  getLocationsAndStationsTMY(addressString: string, radialDistance: number): Observable<LocationsWithStationsResult> {
    const mockLocation: NominatimLocation = {
      addresstype: 'airport',
      display_name: 'MINNEAPOLIS-ST PAUL INTERNATIONAL AP, Minnesota, United States',
      lat: 44.885,
      lon: -93.231,
      place_id: 72658014922
    };

    const mockStations: WeatherStation[] = [
      {
        name: "MINNEAPOLIS-ST PAUL INT'L ARP",
        lat: 44.882531,
        long: -93.231909,
        distance: 8.24,
        country: 'US',
        state: 'MN',
        stationId: '72658000000',
        beginDate: new Date('1500-01-01'),
        endDate: new Date('2000-12-31'),
        isTMYData: true,
        ratingPercent: 100
      }
    ];

    const result: LocationsWithStationsResult = {
      locations: [mockLocation],
      stationsByPlaceId: {
        [mockLocation.place_id]: mockStations
      }
    };
    return of(result);
  }
}
