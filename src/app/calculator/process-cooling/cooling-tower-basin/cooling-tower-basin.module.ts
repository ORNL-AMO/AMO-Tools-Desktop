import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoolingTowerBasinComponent } from './cooling-tower-basin.component';
import { CoolingTowerBasinFormComponent } from './cooling-tower-basin-form/cooling-tower-basin-form.component';
import { CoolingTowerBasinResultsComponent } from './cooling-tower-basin-results/cooling-tower-basin-results.component';
import { CoolingTowerBasinHelpComponent } from './cooling-tower-basin-help/cooling-tower-basin-help.component';
import { CoolingTowerBasinService } from './cooling-tower-basin.service';
import { CoolingTowerBasinFormService } from './cooling-tower-basin-form.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { SuiteDbModule } from '../../../suiteDb/suiteDb.module';



@NgModule({
  declarations: [
    CoolingTowerBasinComponent,
    CoolingTowerBasinFormComponent, 
    CoolingTowerBasinResultsComponent, 
    CoolingTowerBasinHelpComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SuiteDbModule,
    SharedPipesModule,
    OperatingHoursModalModule,
    ExportableResultsTableModule,
    ReactiveFormsModule,
  ],
  exports: [
    CoolingTowerBasinComponent
  ],
  providers: [
    CoolingTowerBasinService,
    CoolingTowerBasinFormService
  ]
})
export class CoolingTowerBasinModule { }
