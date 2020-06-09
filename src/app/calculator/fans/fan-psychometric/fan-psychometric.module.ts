import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FanPsychometricFormComponent } from './fan-psychometric-form/fan-psychometric-form.component';
import { FanPsychometricHelpComponent } from './fan-psychometric-help/fan-psychometric-help.component';
import { FanPsychometricService } from './fan-psychometric.service';
import { FanPsychometricTableComponent } from './fan-psychometric-table/fan-psychometric-table.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { GasDensityResultsModule } from '../../../shared/gas-density-results/gas-density-results.module';
import { FanPsychometricComponent } from './fan-psychometric.component';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';



@NgModule({
  declarations: [
    FanPsychometricFormComponent, 
    FanPsychometricHelpComponent, 
    FanPsychometricTableComponent,
    FanPsychometricComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ExportableResultsTableModule,
    GasDensityResultsModule,
    SharedPipesModule
  ],
  providers: [
    FanPsychometricService
  ]
})
export class FanPsychometricModule { }
