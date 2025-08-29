import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeadToolModule } from './head-tool/head-tool.module';
import { AchievableEfficiencyModule } from './achievable-efficiency/achievable-efficiency.module';
import { SpecificSpeedModule } from './specific-speed/specific-speed.module';
import { SystemAndEquipmentCurveModule } from '../system-and-equipment-curve/system-and-equipment-curve.module';
import { PumpsListComponent } from './pumps-list/pumps-list.component';
import { RouterModule } from '@angular/router';
import { ValveEnergyLossModule } from './valve-energy-loss/valve-energy-loss.module';

@NgModule({
    declarations: [
        PumpsListComponent
    ],
    exports: [
        PumpsListComponent
    ],
    imports: [
        CommonModule,
        // ModalModule,
        SpecificSpeedModule,
        HeadToolModule,
        AchievableEfficiencyModule,
        SystemAndEquipmentCurveModule,
        RouterModule,
        ValveEnergyLossModule
    ]
})

export class PumpsModule { }
