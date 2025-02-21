import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedwaterEconomizerResultsComponent } from './feedwater-economizer-results/feedwater-economizer-results.component';
import { FeedwaterEconomizerFormComponent } from './feedwater-economizer-form/feedwater-economizer-form.component';
import { FeedwaterEconomizerHelpComponent } from './feedwater-economizer-help/feedwater-economizer-help.component';
import { FeedwaterEconomizerComponent } from './feedwater-economizer.component';
import { FeedwaterEconomizerService } from './feedwater-economizer.service';
import { FeedwaterEconomizerFormService } from './feedwater-economizer-form.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { SuiteDbModule } from '../../../suiteDb/suiteDb.module';
import { FlueGasMoistureModalModule } from '../../../shared/flue-gas-moisture-modal/flue-gas-moisture-modal.module';



@NgModule({
  declarations: [
    FeedwaterEconomizerResultsComponent, 
    FeedwaterEconomizerFormComponent, 
    FeedwaterEconomizerHelpComponent,
    FeedwaterEconomizerComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ModalModule,
    SuiteDbModule,
    SharedPipesModule,
    ExportableResultsTableModule,
    OperatingHoursModalModule,
    FlueGasMoistureModalModule
  ],
  exports: [
    FeedwaterEconomizerComponent
  ],
  providers: [
    FeedwaterEconomizerService,
    FeedwaterEconomizerFormService
  ]
})
export class FeedwaterEconomizerModule { }
