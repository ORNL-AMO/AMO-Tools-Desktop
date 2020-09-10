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
import { ModalModule } from 'ngx-bootstrap';
import { AnimatedCheckmarkModule } from '../shared/animated-checkmark/animated-checkmark.module';

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

    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ModalModule,
        AnimatedCheckmarkModule
    ],
    providers: [
        SettingsService
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
