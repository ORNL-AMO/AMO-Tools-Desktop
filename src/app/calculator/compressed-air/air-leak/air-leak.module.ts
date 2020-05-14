import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AirLeakComponent } from './air-leak.component';
import { AirLeakService } from './air-leak.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AirLeakSurveyResultsComponent } from './air-leak-results/air-leak-results.component';
import { AirLeakHelpComponent } from './air-leak-help/air-leak-help.component';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { ConvertAirLeakService } from './convert-air-leak.service';
import { FacilityCompressorDataFormComponent } from './facility-compressor-data-form/facility-compressor-data-form.component';
import { AirLeakFormComponent } from './air-leak-form/air-leak-form.component';
import { AirLeakResultsTableComponent } from './air-leak-results-table/air-leak-results-table.component';
import { AirLeakCopyTableComponent } from './air-leak-copy-table/air-leak-copy-table.component';



@NgModule({
  declarations: [
    AirLeakComponent, 
    AirLeakSurveyResultsComponent, 
    AirLeakHelpComponent, 
    FacilityCompressorDataFormComponent, 
    AirLeakFormComponent, 
    AirLeakResultsTableComponent, 
    AirLeakCopyTableComponent
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
