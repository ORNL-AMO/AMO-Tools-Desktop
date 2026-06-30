import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CompressedAirDryerComponent } from './compressed-air-dryer.component';
import { CompressedAirDryerFormComponent } from './compressed-air-dryer-form/compressed-air-dryer-form.component';
import { CompressedAirDryerResultsComponent } from './compressed-air-dryer-results/compressed-air-dryer-results.component';
import { CompressedAirDryerHelpComponent } from './compressed-air-dryer-help/compressed-air-dryer-help.component';
import { CompressedAirDryerService } from './compressed-air-dryer.service';
import { CompressedAirDryersSuiteApiService } from '../../../tools-suite-api/compressed-air-dryer-suite-api.service';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';

@NgModule({
  declarations: [
    CompressedAirDryerComponent,
    CompressedAirDryerFormComponent,
    CompressedAirDryerResultsComponent,
    CompressedAirDryerHelpComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ExportableResultsTableModule,
    OperatingHoursModalModule,
  ],
  providers: [
    CompressedAirDryerService,
    CompressedAirDryersSuiteApiService,
  ],
  exports: [
    CompressedAirDryerComponent,
  ],
})
export class CompressedAirDryerModule { }
