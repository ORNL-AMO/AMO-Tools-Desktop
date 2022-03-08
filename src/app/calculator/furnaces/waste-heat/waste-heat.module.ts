import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WasteHeatComponent } from './waste-heat.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SuiteDbModule } from '../../../suiteDb/suiteDb.module';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { WasteHeatService } from './waste-heat.service';
import { WasteHeatFormService } from './waste-heat-form.service';
import { WasteHeatResultsComponent } from './waste-heat-results/waste-heat-results.component';
import { WasteHeatHelpComponent } from './waste-heat-help/waste-heat-help.component';
import { WasteHeatFormComponent } from './waste-heat-form/waste-heat-form.component';
import { FlueGasModule } from '../flue-gas/flue-gas.module';



@NgModule({
  declarations: [
    WasteHeatComponent,
    WasteHeatFormComponent,
    WasteHeatResultsComponent,
    WasteHeatHelpComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule,
    SuiteDbModule,
    SharedPipesModule,
    OperatingHoursModalModule,
    ExportableResultsTableModule,
    FlueGasModule,
  ],
  exports: [
    WasteHeatComponent
  ],
  providers: [
    WasteHeatService,
    WasteHeatFormService
  ]
})
export class WasteHeatModule { }
