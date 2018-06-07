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

@NgModule({
    declarations: [
        ApplicationSettingsComponent,
        PsatSettingsComponent,
        PhastSettingsComponent,
        FsatSettingsComponent,
        SteamSettingsComponent,
        FacilityInfoComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule
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
        SteamSettingsComponent
    ]
})

export class SettingsModule { };
