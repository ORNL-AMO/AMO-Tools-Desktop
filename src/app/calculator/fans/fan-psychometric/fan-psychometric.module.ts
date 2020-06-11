import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FanPsychometricFormComponent } from './fan-psychometric-form/fan-psychometric-form.component';
import { FanPsychometricHelpComponent } from './fan-psychometric-help/fan-psychometric-help.component';
import { FanPsychometricService } from './fan-psychometric.service';
import { FanPsychometricTableComponent } from './fan-psychometric-table/fan-psychometric-table.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { FanPsychometricComponent } from './fan-psychometric.component';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { FanPsychometricResultsComponent } from './fan-psychometric-results/fan-psychometric-results.component';



@NgModule({
  declarations: [
    FanPsychometricFormComponent, 
    FanPsychometricHelpComponent, 
    FanPsychometricTableComponent,
    FanPsychometricComponent,
    FanPsychometricResultsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ExportableResultsTableModule,
    SharedPipesModule
  ],
  providers: [
    FanPsychometricService
  ]
})
export class FanPsychometricModule { }
