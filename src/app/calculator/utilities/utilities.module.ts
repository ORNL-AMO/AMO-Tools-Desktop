import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CombinedHeatPowerModule } from './combined-heat-power/combined-heat-power.module';
import { PreAssessmentModule } from './pre-assessment/pre-assessment.module';
import { PowerFactorCorrectionModule } from './power-factor-correction/power-factor-correction.module';
import { Co2SavingsModule } from './co2-savings/co2-savings.module';
import { ElectricityReductionModule } from './electricity-reduction/electricity-reduction.module';
import { NaturalGasReductionModule } from './natural-gas-reduction/natural-gas-reduction.module';
import { WaterReductionModule } from './water-reduction/water-reduction.module';
import { CashFlowModule } from './cash-flow/cash-flow.module';
import { UnitConverterModule } from './unit-converter/unit-converter.module';
import { PipeInsulationReductionModule } from './pipe-insulation-reduction/pipe-insulation-reduction.module';
import { TankInsulationReductionModule } from './tank-insulation-reduction/tank-insulation-reduction.module';
import { UtilitiesListComponent } from './utilities-list/utilities-list.component';
import { RouterModule } from '@angular/router';
import { FanPsychrometricModule } from './fan-psychrometric/fan-psychrometric.module';

@NgModule({
    declarations: [
        UtilitiesListComponent
    ],
    exports: [
        UtilitiesListComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CombinedHeatPowerModule,
        PreAssessmentModule,
        PowerFactorCorrectionModule,
        Co2SavingsModule,
        ElectricityReductionModule,
        NaturalGasReductionModule,
        WaterReductionModule,
        PipeInsulationReductionModule,
        TankInsulationReductionModule,
        CashFlowModule,
        UnitConverterModule,
        RouterModule,
        FanPsychrometricModule
    ]
})

export class UtilitiesModule { }
