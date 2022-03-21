import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ApplicationSettingsComponent } from './application-settings/application-settings.component';
import { PsatSettingsComponent } from './psat-settings/psat-settings.component';
import { SteamSettingsComponent } from './steam-settings/steam-settings.component';
import { PhastSettingsComponent } from './phast-settings/phast-settings.component';
import { SettingsService } from './settings.service';
import { FacilityInfoComponent } from './facility-info/facility-info.component';
import { FsatSettingsComponent } from './fsat-settings/fsat-settings.component';
import { TutorialSettingsComponent } from './tutorial-settings/tutorial-settings.component';
import { TreasureHuntSettingsComponent } from './treasure-hunt-settings/treasure-hunt-settings.component';
import { AssessmentSettingsComponent } from './assessment-settings/assessment-settings.component';
import { ResetDataModalComponent } from './assessment-settings/reset-data-modal/reset-data-modal.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AnimatedCheckmarkModule } from '../shared/animated-checkmark/animated-checkmark.module';
import { RouterModule } from '@angular/router';
import { PrintSettingsComponent } from './print-settings/print-settings.component';
import { Co2SavingsSettingsComponent } from './co2-savings-settings/co2-savings-settings.component';
import { AssessmentCo2SavingsModule } from '../shared/assessment-co2-savings/assessment-co2-savings.module';

@NgModule({
    declarations: [
        ApplicationSettingsComponent,
        PsatSettingsComponent,
        PhastSettingsComponent,
        FsatSettingsComponent,
        SteamSettingsComponent,
        FacilityInfoComponent,
        TutorialSettingsComponent,
        TreasureHuntSettingsComponent,
        AssessmentSettingsComponent,
        ResetDataModalComponent,
        PrintSettingsComponent,
        Co2SavingsSettingsComponent,

    ],
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        ModalModule,
        AnimatedCheckmarkModule,
        AssessmentCo2SavingsModule
    ],
    providers: [
        SettingsService,
    ],
    exports: [
        PsatSettingsComponent,
        ApplicationSettingsComponent,
        PhastSettingsComponent,
        FacilityInfoComponent,
        FsatSettingsComponent,
        SteamSettingsComponent,
        TutorialSettingsComponent,
        TreasureHuntSettingsComponent,
        AssessmentSettingsComponent
    ]
})

export class SettingsModule { };
