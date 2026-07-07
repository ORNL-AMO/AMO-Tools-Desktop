import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';

import { AirLeakSurveyComponent } from './air-leak-survey.component';
import { AirLeakSurveyService } from './air-leak-survey.service';
import { AirLeakSurveyFormService } from './air-leak-survey-form/air-leak-survey-form.service';
import { ConvertAirLeakService } from './convert-air-leak.service';

import { SurveyFacilityCompressorDataFormComponent } from './facility-compressor-data-form/facility-compressor-data-form.component';
import { AirLeakSurveyFormComponent } from './air-leak-survey-form/air-leak-survey-form.component';
import { SurveyEstimateMethodFormComponent } from './air-leak-survey-form/estimate-method-form/estimate-method-form.component';
import { SurveyBagMethodFormComponent } from './air-leak-survey-form/bag-method-form/bag-method-form.component';
import { SurveyOrificeMethodFormComponent } from './air-leak-survey-form/orifice-method-form/orifice-method-form.component';
import { SurveyDecibelMethodFormComponent } from './air-leak-survey-form/decibel-method-form/decibel-method-form.component';
import { AirLeakSurveyResultsComponent } from './air-leak-survey-results/air-leak-survey-results.component';
import { AirLeakSurveyResultsTableComponent } from './air-leak-survey-results-table/air-leak-survey-results-table.component';
import { AirLeakSurveyCopyTableComponent } from './air-leak-survey-copy-table/air-leak-survey-copy-table.component';
import { AirLeakSurveyHelpComponent } from './air-leak-survey-help/air-leak-survey-help.component';

@NgModule({
  declarations: [
    AirLeakSurveyComponent,
    SurveyFacilityCompressorDataFormComponent,
    AirLeakSurveyFormComponent,
    SurveyEstimateMethodFormComponent,
    SurveyBagMethodFormComponent,
    SurveyOrificeMethodFormComponent,
    SurveyDecibelMethodFormComponent,
    AirLeakSurveyResultsComponent,
    AirLeakSurveyResultsTableComponent,
    AirLeakSurveyCopyTableComponent,
    AirLeakSurveyHelpComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    OperatingHoursModalModule,
    ExportableResultsTableModule,
  ],
  exports: [AirLeakSurveyComponent],
  providers: [
    AirLeakSurveyService,
    AirLeakSurveyFormService,
    ConvertAirLeakService,
  ],
})
export class AirLeakSurveyModule {}
