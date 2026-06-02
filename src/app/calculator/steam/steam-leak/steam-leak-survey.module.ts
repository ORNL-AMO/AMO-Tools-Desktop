import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';

import  { SteamLeakSurveyComponent } from "./steam-leak-survey.component";
import { SteamLeakSurveyService } from './steam-leak-survey-service';

@NgModule({
    declarations: [
        SteamLeakSurveyComponent,
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