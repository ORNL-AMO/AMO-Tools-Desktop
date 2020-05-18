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
import { DecibelMethodFormComponent } from './air-leak-form/decibel-method-form/decibel-method-form.component';
import { EstimateMethodFormComponent } from './air-leak-form/estimate-method-form/estimate-method-form.component';
import { OrificeMethodFormComponent } from './air-leak-form/orifice-method-form/orifice-method-form.component';
import { BagMethodFormComponent } from './air-leak-form/bag-method-form/bag-method-form.component';
import { AirLeakFormService } from './air-leak-form/air-leak-form.service';



@NgModule({
  declarations: [
    AirLeakComponent, 
    AirLeakSurveyResultsComponent, 
    AirLeakHelpComponent, 
    FacilityCompressorDataFormComponent, 
    AirLeakFormComponent, 
    AirLeakResultsTableComponent, 
    AirLeakCopyTableComponent, 
    DecibelMethodFormComponent, 
    EstimateMethodFormComponent, 
    OrificeMethodFormComponent, BagMethodFormComponent
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
    AirLeakFormService,
    ConvertAirLeakService
  ]
})
export class AirLeakModule { }
