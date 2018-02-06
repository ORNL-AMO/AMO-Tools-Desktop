import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ApplicationSettingsComponent } from './application-settings/application-settings.component';
import { PsatSettingsComponent } from './psat-settings/psat-settings.component';
import { PhastSettingsComponent } from './phast-settings/phast-settings.component';
import { SettingsService } from './settings.service';
import { FacilityInfoComponent } from './facility-info/facility-info.component';

@NgModule({
    declarations: [
        ApplicationSettingsComponent,
        PsatSettingsComponent,
        PhastSettingsComponent,
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
        FacilityInfoComponent
    ]
})

export class SettingsModule { };