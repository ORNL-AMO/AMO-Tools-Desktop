import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CondensingEconomizerFormComponent } from './condensing-economizer-form/condensing-economizer-form.component';
import { CondensingEconomizerHelpComponent } from './condensing-economizer-help/condensing-economizer-help.component';
import { CondensingEconomizerResultsComponent } from './condensing-economizer-results/condensing-economizer-results.component';
import { CondensingEconomizerComponent } from './condensing-economizer.component';
import { CondensingEconomizerService } from './condensing-economizer.service';
import { CondensingEconomizerFormService } from './condensing-economizer-form.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { SuiteDbModule } from '../../../suiteDb/suiteDb.module';



@NgModule({
  declarations: [
    CondensingEconomizerFormComponent, 
    CondensingEconomizerHelpComponent, 
    CondensingEconomizerResultsComponent,
    CondensingEconomizerComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ModalModule,
    SuiteDbModule,
    SharedPipesModule,
    ExportableResultsTableModule,
    OperatingHoursModalModule
  ],
  providers: [
    CondensingEconomizerService,
    CondensingEconomizerFormService,
  ],
  exports: [
    CondensingEconomizerComponent
  ]
})
export class CondensingEconomizerModule { }
