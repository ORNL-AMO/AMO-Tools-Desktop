import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UtilitiesComponent } from './utilities.component';
import { UnitConverterComponent } from './unit-converter/unit-converter.component';
import { SortByPipe } from './unit-converter/sort-by.pipe';

import { CombinedHeatPowerModule } from './combined-heat-power/combined-heat-power.module';
import { PreAssessmentModule } from './pre-assessment/pre-assessment.module';
import { PowerFactorCorrectionModule } from './power-factor-correction/power-factor-correction.module';
import { UnitConverterService } from './unit-converter/unit-converter.service';
import { Co2SavingsModule } from './co2-savings/co2-savings.module';
import { ElectricityReductionModule } from './electricity-reduction/electricity-reduction.module';
import { NaturalGasReductionModule } from './natural-gas-reduction/natural-gas-reduction.module';
import { CompressedAirReductionModule } from './compressed-air-reduction/compressed-air-reduction.module';
import { WaterReductionModule } from './water-reduction/water-reduction.module';
import { CompressedAirPressureReductionModule } from './compressed-air-pressure-reduction/compressed-air-pressure-reduction.module';
import { SteamReductionModule } from './steam-reduction/steam-reduction.module';
import { CashFlowModule } from './cash-flow/cash-flow.module';
import { UnitConverterModule } from './unit-converter/unit-converter.module';
import { PipeInsulationReductionModule } from './pipe-insulation-reduction/pipe-insulation-reduction.module';
import { TankInsulationReductionModule } from './tank-insulation-reduction/tank-insulation-reduction.module';

@NgModule({
    declarations: [
        UtilitiesComponent
    ],
    exports: [
        UtilitiesComponent
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
        CompressedAirReductionModule,
        CompressedAirPressureReductionModule,
        SteamReductionModule,
        WaterReductionModule,
        PipeInsulationReductionModule,
        TankInsulationReductionModule,
        CashFlowModule,
        UnitConverterModule
    ]
})

export class UtilitiesModule { }
