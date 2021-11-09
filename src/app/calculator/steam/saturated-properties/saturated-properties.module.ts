import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SaturatedPropertiesComponent } from './saturated-properties.component';
import { SaturatedPropertiesFormComponent } from './saturated-properties-form/saturated-properties-form.component';
import { ReactiveFormsModule } from "@angular/forms";
import { SaturatedPropertiesHelpComponent } from './saturated-properties-help/saturated-properties-help.component';
import { SaturatedPropertiesTableComponent } from './saturated-properties-table/saturated-properties-table.component';
import { SimpleTooltipModule } from '../../../shared/simple-tooltip/simple-tooltip.module';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { SaturatedPropertiesPhChartComponent } from './saturated-properties-ph-chart/saturated-properties-ph-chart.component';
import { SaturatedPropertiesChartComponent } from './saturated-properties-chart/saturated-properties-chart.component';
import { SaturatedPropertiesHiddenCopyTableComponent } from './saturated-properties-hidden-copy-table/saturated-properties-hidden-copy-table.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SimpleTooltipModule,
    SharedPipesModule,
    ExportableResultsTableModule
  ],
  declarations: [ 
    SaturatedPropertiesPhChartComponent,
    SaturatedPropertiesChartComponent,
    SaturatedPropertiesComponent, 
    SaturatedPropertiesFormComponent, 
    SaturatedPropertiesHelpComponent, 
    SaturatedPropertiesTableComponent, 
    SaturatedPropertiesChartComponent, 
    SaturatedPropertiesPhChartComponent, SaturatedPropertiesHiddenCopyTableComponent
  ],
  exports: [
    SaturatedPropertiesComponent
  ]
})
export class SaturatedPropertiesModule { }


