import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { ModalModule } from 'ng2-bootstrap';

import { SystemCurveComponent } from './system-curve/system-curve.component';
import { SystemCurveFormComponent } from './system-curve/system-curve-form/system-curve-form.component';
import { SystemCurveGraphComponent } from './system-curve/system-curve-graph/system-curve-graph.component';

import { HeadToolComponent } from './head-tool/head-tool.component';
import { HeadToolFormComponent } from './head-tool/head-tool-form/head-tool-form.component';
import { HeadToolHelpComponent } from './head-tool/head-tool-help/head-tool-help.component';
import { HeadToolResultsComponent } from './head-tool/head-tool-results/head-tool-results.component';
import { HeadToolSuctionFormComponent } from './head-tool/head-tool-suction-form/head-tool-suction-form.component';

import { SpecificSpeedComponent } from './specific-speed/specific-speed.component';

import { NemaEnergyEfficiencyComponent } from './nema-energy-efficiency/nema-energy-efficiency.component';
import { NemaEnergyEfficiencyFormComponent } from './nema-energy-efficiency/nema-energy-efficiency-form/nema-energy-efficiency-form.component';
import { NemaEnergyEfficiencyGraphComponent } from './nema-energy-efficiency/nema-energy-efficiency-graph/nema-energy-efficiency-graph.component';

import { MotorPerformanceComponent } from './motor-performance/motor-performance.component';

import { AchievableEfficiencyComponent } from './achievable-efficiency/achievable-efficiency.component';

import { PumpsComponent } from './pumps.component';
import { AchievableEfficiencyFormComponent } from './achievable-efficiency/achievable-efficiency-form/achievable-efficiency-form.component';
import { AchievableEfficiencyGraphComponent } from './achievable-efficiency/achievable-efficiency-graph/achievable-efficiency-graph.component';

@NgModule({
    declarations: [
        PumpsComponent,
        SystemCurveComponent,
        SystemCurveFormComponent,
        SystemCurveGraphComponent,
        HeadToolComponent,
        HeadToolFormComponent,
        HeadToolHelpComponent,
        HeadToolResultsComponent,
        HeadToolSuctionFormComponent,
        SpecificSpeedComponent,
        NemaEnergyEfficiencyComponent,
        NemaEnergyEfficiencyFormComponent,
        NemaEnergyEfficiencyGraphComponent,
        MotorPerformanceComponent,
        AchievableEfficiencyComponent,
        AchievableEfficiencyFormComponent,
        AchievableEfficiencyGraphComponent
    ],
    exports:[
        SystemCurveComponent,
        NemaEnergyEfficiencyComponent,
        MotorPerformanceComponent,
        HeadToolComponent,
        AchievableEfficiencyComponent,
        SpecificSpeedComponent,
        PumpsComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        ModalModule
    ],
    providers: []
})

export class PumpsModule {}