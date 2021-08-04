import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChillerStagingComponent } from './chiller-staging.component';
import { ChillerStagingFormComponent } from './chiller-staging-form/chiller-staging-form.component';
import { ChillerStagingResultsComponent } from './chiller-staging-results/chiller-staging-results.component';
import { ChillerStagingHelpComponent } from './chiller-staging-help/chiller-staging-help.component';
import { ChillerStagingService } from './chiller-staging.service';
import { ChillerStagingFormService } from './chiller-staging-form.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { SimpleTooltipModule } from '../../../shared/simple-tooltip/simple-tooltip.module';
import { SuiteDbModule } from '../../../suiteDb/suiteDb.module';



@NgModule({
  declarations: [
    ChillerStagingComponent,
    ChillerStagingFormComponent,
    ChillerStagingResultsComponent,
    ChillerStagingHelpComponent
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
    ChillerStagingComponent
  ],
  providers: [
    ChillerStagingService,
    ChillerStagingFormService
  ]
})
export class ChillerStagingModule { }
