import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AirLeakComponent } from './air-leak.component';
import { AirLeakFormComponent } from './air-leak-form/air-leak-form.component';
import { AirLeakService } from './air-leak.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AirLeakSurveyResultsComponent } from './air-leak-results/air-leak-results.component';
import { AirLeakHelpComponent } from './air-leak-help/air-leak-help.component';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { ConvertAirLeakService } from './convert-air-leak.service';



@NgModule({
  declarations: [
    AirLeakComponent, 
    AirLeakFormComponent, AirLeakSurveyResultsComponent, AirLeakHelpComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    OperatingHoursModalModule,
    ExportableResultsTableModule
  ],
  exports: [
    AirLeakComponent
  ],
  providers: [
    AirLeakService,
    ConvertAirLeakService
  ]
})
export class AirLeakModule { }
