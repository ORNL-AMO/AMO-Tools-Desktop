import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { ModalModule } from 'ngx-bootstrap';
import { ChartsModule } from 'ng2-charts';

import { SystemCurveModule } from './system-curve/system-curve.module';
import { HeadToolModule } from './head-tool/head-tool.module';
// import { NemaEnergyEfficiencyModule} from '../motors/nema-energy-efficiency/nema-energy-efficiency.module';
// import { MotorPerformanceModule } from '../motors/motor-performance/motor-performance.module';
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
        SharedModule,
        ModalModule,
        ChartsModule,
        SystemCurveModule,
        SpecificSpeedModule,
        // NemaEnergyEfficiencyModule,
        // MotorPerformanceModule,
        HeadToolModule,
        AchievableEfficiencyModule,
        PumpCurveModule
    ],
    providers: [

    ]
})

export class PumpsModule { }
