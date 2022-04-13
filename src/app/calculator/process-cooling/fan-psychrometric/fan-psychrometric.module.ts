import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FanPsychrometricFormComponent } from './fan-psychrometric-form/fan-psychrometric-form.component';
import { FanPsychrometricHelpComponent } from './fan-psychrometric-help/fan-psychrometric-help.component';
import { FanPsychrometricService } from './fan-psychrometric.service';
import { FanPsychrometricTableComponent } from './fan-psychrometric-table/fan-psychrometric-table.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { FanPsychrometricComponent } from './fan-psychrometric.component';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { FanPsychrometricResultsComponent } from './fan-psychrometric-results/fan-psychrometric-results.component';
import { FanPsychrometricChartComponent } from './fan-psychrometric-chart/fan-psychrometric-chart.component';
import { PsychrometricChartComponent } from './psychrometric-chart/psychrometric-chart.component';
import { SimpleTooltipModule } from '../../../shared/simple-tooltip/simple-tooltip.module';


@NgModule({
  declarations: [
    FanPsychrometricFormComponent, 
    FanPsychrometricHelpComponent, 
    FanPsychrometricTableComponent,
    FanPsychrometricComponent,
    FanPsychrometricResultsComponent,
    FanPsychrometricChartComponent,
    PsychrometricChartComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ExportableResultsTableModule,
    SimpleTooltipModule,
    SharedPipesModule
  ],
  providers: [
    FanPsychrometricService
  ]
})
export class FanPsychrometricModule { }
