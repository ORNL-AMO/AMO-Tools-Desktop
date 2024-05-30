import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherBinsComponent } from './weather-bins.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WeatherBinsService } from './weather-bins.service';
import { WeatherBinsHelpComponent } from './weather-bins-help/weather-bins-help.component';
import { DataSetupFormComponent } from './weather-bins-form/data-setup-form/data-setup-form.component';
import { WeatherBinsBarChartComponent } from './weather-bins-bar-chart/weather-bins-bar-chart.component';
import { BinsFormComponent } from './weather-bins-form/bins-form/bins-form.component';
import { ParameterUnitComponent } from './weather-bins-form/parameter-unit/parameter-unit.component';
import { WeatherDbService } from './weather-db.service';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { WeatherBinsTableComponent } from './weather-bins-table/weather-bins-table.component';
import { WeatherStationLookupModule } from '../../../shared/weather-station-lookup/weather-station-lookup.module';
import { WeatherBinsHeatMapComponent } from './weather-bins-heat-map/weather-bins-heat-map.component';
import { BinDetailFormComponent } from './weather-bins-form/bin-detail-form/bin-detail-form.component';
import { AnimatedCheckmarkModule } from '../../../shared/animated-checkmark/animated-checkmark.module';
import { ClipboardModule } from 'ngx-clipboard';



@NgModule({
  declarations: [
    WeatherBinsComponent, 
    WeatherBinsHelpComponent, 
    DataSetupFormComponent, 
    WeatherBinsBarChartComponent, 
    WeatherBinsHeatMapComponent,
    BinsFormComponent, 
    ParameterUnitComponent, 
    WeatherBinsTableComponent,
    BinDetailFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ExportableResultsTableModule,
    WeatherStationLookupModule,
    AnimatedCheckmarkModule,
    ClipboardModule
  ],
  exports: [
    WeatherBinsHelpComponent,
    WeatherBinsBarChartComponent,
    WeatherBinsHeatMapComponent,
    WeatherBinsTableComponent
  ],
  providers: [
    WeatherDbService,
    WeatherBinsService
  ]
})
export class WeatherBinsModule { }
