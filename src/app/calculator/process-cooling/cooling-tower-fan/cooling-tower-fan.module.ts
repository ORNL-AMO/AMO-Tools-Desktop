import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoolingTowerFanFormComponent } from './cooling-tower-fan-form/cooling-tower-fan-form.component';
import { CoolingTowerFanHelpComponent } from './cooling-tower-fan-help/cooling-tower-fan-help.component';
import { CoolingTowerFanResultsComponent } from './cooling-tower-fan-results/cooling-tower-fan-results.component';
import { CoolingTowerFanChartComponent } from './cooling-tower-fan-chart/cooling-tower-fan-chart.component';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { SuiteDbModule } from '../../../suiteDb/suiteDb.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { SimpleTooltipModule } from '../../../shared/simple-tooltip/simple-tooltip.module';
import { CoolingTowerFanService } from './cooling-tower-fan.service';
import { CoolingTowerFanComponent } from './cooling-tower-fan.component';
import { CoolingTowerFanFormService } from './cooling-tower-fan-form.service';



@NgModule({
  declarations: [
    CoolingTowerFanFormComponent, 
    CoolingTowerFanHelpComponent, 
    CoolingTowerFanResultsComponent, 
    CoolingTowerFanChartComponent,
    CoolingTowerFanComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SuiteDbModule,
    SharedPipesModule,
    OperatingHoursModalModule,
    ExportableResultsTableModule,
    ReactiveFormsModule,
    SimpleTooltipModule
  ],
  exports: [
    CoolingTowerFanComponent
  ],
  providers: [
    CoolingTowerFanFormService,
    CoolingTowerFanService
  ]
})
export class CoolingTowerFanModule { }
