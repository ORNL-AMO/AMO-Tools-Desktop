import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SteamPropertiesComponent } from './steam-properties.component';
import { SteamPropertiesFormComponent } from './steam-properties-form/steam-properties-form.component';
import { ReactiveFormsModule } from "@angular/forms";
import { SteamPropertiesHelpComponent } from './steam-properties-help/steam-properties-help.component';
import { SteamPropertiesTableComponent } from './steam-properties-table/steam-properties-table.component';
import { SimpleTooltipModule } from '../../../shared/simple-tooltip/simple-tooltip.module';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { SteamPropertiesPhChartComponent } from './steam-properties-ph-chart/steam-properties-ph-chart.component';
import { SteamPropertiesChartComponent } from './steam-properties-chart/steam-properties-chart.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SimpleTooltipModule,
    SharedPipesModule,
    ExportableResultsTableModule
  ],
  declarations: [
    SteamPropertiesComponent,
    SteamPropertiesFormComponent,
    SteamPropertiesHelpComponent,
    SteamPropertiesTableComponent,
    SteamPropertiesChartComponent,
    SteamPropertiesPhChartComponent
  ],
  exports: [
    SteamPropertiesComponent
  ]
})
export class SteamPropertiesModule { }
