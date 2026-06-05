import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';

import  { SteamLeakSurveyComponent } from "./steam-leak-survey.component";
import { SteamLeakSurveyService } from './steam-leak-survey-service';
import { SteamLeakSurveyFormComponent } from './steam-leak-survey-form/steam-leak-survey-form.component';
import { SteamLeakSurveyFormService } from './steam-leak-survey-form/steam-leak-survey-form.service';
import { CostOfSteamFormComponent } from './cost-of-steam-form/cost-of-steam-form.component';
import { SteamLeakSurveyResultsTableComponent } from './steam-leak-survey-results-table/steam-leak-survey-results-table.component';

@NgModule({
    declarations: [
        SteamLeakSurveyComponent,
        SteamLeakSurveyFormComponent,
        CostOfSteamFormComponent,
        SteamLeakSurveyResultsTableComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        OperatingHoursModalModule,
        ExportableResultsTableModule,
    ],
    exports: [SteamLeakSurveyComponent],
    providers: [
        SteamLeakSurveyService,
    ]
})
export class SteamLeakSurveyModule {}