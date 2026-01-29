import { WeatherDataComponent } from "../weather-data.component";
import { WeatherStationsComponent } from "../weather-stations/weather-stations.component";
import { AnnualStationDataComponent } from "../annual-station-data/annual-station-data.component";
import { Route } from '@angular/router';

export const ROUTE_TOKENS = {
    home: 'weather',
    stations: 'stations',
    annualStation: 'annual-station'
} as const;

const WEATHER_ROUTES: Route[] = [
  {
    path: "",
    component: WeatherDataComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: ROUTE_TOKENS.stations },
      { path: ROUTE_TOKENS.stations, component: WeatherStationsComponent },
      { path: ROUTE_TOKENS.annualStation, component: AnnualStationDataComponent },
    ]
  }
];


export default WEATHER_ROUTES;