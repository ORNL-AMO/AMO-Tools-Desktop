import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherDataComponent } from './weather-data.component';
import { FormsModule } from '@angular/forms';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { Route, RouterModule } from '@angular/router';
import { WeatherStationsComponent } from './weather-stations/weather-stations.component';
import { WeatherStationsTableComponent } from './weather-stations/weather-stations-table/weather-stations-table.component';
import { WeatherStationsMapComponent } from './weather-stations/weather-stations-map/weather-stations-map.component';
import { OrderByPipe } from '../../shared-pipes/order-by.pipe';
import { AnnualStationDataComponent } from './annual-station-data/annual-station-data.component';
import { LoadingSpinnerComponent } from '../../loading-spinner/loading-spinner.component';
import { WeatherApiService } from '../../weather-api.service';
import { AnnualStationGraphComponent } from './annual-station-data/annual-station-graph/annual-station-graph.component';

export const ROUTES: Route[] = [
  //  working
  {
    path: "",
    component: WeatherDataComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'stations' },
      { path: 'stations', component: WeatherStationsComponent },
      { path: 'annual-station', component: AnnualStationDataComponent },
    ]
  }
];


@NgModule({
  declarations: [
    WeatherDataComponent,
    WeatherStationsComponent,
    WeatherStationsTableComponent,
    WeatherStationsMapComponent,
    AnnualStationDataComponent,
    AnnualStationGraphComponent
  ],
   exports: [
    WeatherDataComponent
  ],
  imports: [
    RouterModule.forChild(ROUTES),
    CommonModule,
    FormsModule,
    NgbPaginationModule,
    OrderByPipe,
    LoadingSpinnerComponent
  ],
  providers: [
    WeatherApiService
  ]
})
export class WeatherDataModule { }
