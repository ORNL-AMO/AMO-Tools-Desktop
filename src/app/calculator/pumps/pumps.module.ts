import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'ngx-bootstrap';
import { SystemCurveModule } from './system-curve/system-curve.module';
import { HeadToolModule } from './head-tool/head-tool.module';
import { AchievableEfficiencyModule } from './achievable-efficiency/achievable-efficiency.module';
import { SpecificSpeedModule } from './specific-speed/specific-speed.module';
import { PumpCurveModule } from './pump-curve/pump-curve.module';
import { PumpsComponent } from './pumps.component';
import { SystemAndEquipmentCurveModule } from '../system-and-equipment-curve/system-and-equipment-curve.module';

@NgModule({
    declarations: [
        PumpsComponent
    ],
    exports: [
        PumpsComponent
    ],
    imports: [
        CommonModule,
        ModalModule,
        SystemCurveModule,
        SpecificSpeedModule,
        HeadToolModule,
        AchievableEfficiencyModule,
        PumpCurveModule,
        SystemAndEquipmentCurveModule
    ]
})

export class PumpsModule { }
