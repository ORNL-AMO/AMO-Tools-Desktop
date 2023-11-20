import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoilerBlowdownRateComponent } from './boiler-blowdown-rate.component';
import { BlowdownRateHelpComponent } from './blowdown-rate-help/blowdown-rate-help.component';
import { BlowdownRateResultsComponent } from './blowdown-rate-results/blowdown-rate-results.component';
import { BlowdownRateFormComponent } from './blowdown-rate-form/blowdown-rate-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { BoilerBlowdownRateService } from './boiler-blowdown-rate.service';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { StackLossModule } from '../stack-loss/stack-loss.module';

@NgModule({
  declarations: [BoilerBlowdownRateComponent, BlowdownRateHelpComponent, BlowdownRateResultsComponent, BlowdownRateFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedPipesModule,
    OperatingHoursModalModule,
    ExportableResultsTableModule,
    StackLossModule
  ],
  exports: [BoilerBlowdownRateComponent],
  providers: [BoilerBlowdownRateService]
})
export class BoilerBlowdownRateModule { }
