import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap';
import { SystemCurveModule } from './system-curve/system-curve.module';
import { HeadToolModule } from './head-tool/head-tool.module';
import { AchievableEfficiencyModule } from './achievable-efficiency/achievable-efficiency.module';
import { SpecificSpeedModule } from './specific-speed/specific-speed.module';
import { PumpCurveModule } from './pump-curve/pump-curve.module';


import { PumpsComponent } from './pumps.component';

@NgModule({
    declarations: [
        PumpsComponent
    ],
    exports: [
        PumpsComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ModalModule,
        SystemCurveModule,
        SpecificSpeedModule,
        HeadToolModule,
        AchievableEfficiencyModule,
        PumpCurveModule
    ]
})

export class PumpsModule { }
