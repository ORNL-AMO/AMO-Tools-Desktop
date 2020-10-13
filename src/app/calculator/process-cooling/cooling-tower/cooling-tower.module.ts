import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoolingTowerFormComponent } from './cooling-tower-form/cooling-tower-form.component';
import { CoolingTowerResultsComponent } from './cooling-tower-results/cooling-tower-results.component';
import { CoolingTowerHelpComponent } from './cooling-tower-help/cooling-tower-help.component';
import { CoolingTowerService } from './cooling-tower.service';
import { CoolingTowerComponent } from './cooling-tower.component';
import { ReactiveFormsModule } from '@angular/forms';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { PercentGraphModule } from '../../../shared/percent-graph/percent-graph.module';



@NgModule({
  declarations: [
    CoolingTowerFormComponent,
    CoolingTowerResultsComponent,
    CoolingTowerHelpComponent,
    CoolingTowerComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    OperatingHoursModalModule,
    PercentGraphModule,
    ExportableResultsTableModule
  ],
  providers: [
    CoolingTowerService
  ],
  exports: [
    CoolingTowerComponent
  ]
})
export class CoolingTowerModule { }
