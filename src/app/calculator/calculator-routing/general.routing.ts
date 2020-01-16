import { Routes } from "@angular/router";
import { CashFlowComponent } from "../utilities/cash-flow/cash-flow.component";
import { Co2SavingsComponent } from "../utilities/co2-savings/co2-savings.component";
import { CombinedHeatPowerComponent } from "../utilities/combined-heat-power/combined-heat-power.component";
import { CompressedAirPressureReductionComponent } from "../utilities/compressed-air-pressure-reduction/compressed-air-pressure-reduction.component";
import { CompressedAirReductionComponent } from "../utilities/compressed-air-reduction/compressed-air-reduction.component";
import { ElectricityReductionComponent } from "../utilities/electricity-reduction/electricity-reduction.component";
import { NaturalGasReductionComponent } from "../utilities/natural-gas-reduction/natural-gas-reduction.component";
import { PipeInsulationReductionComponent } from "../utilities/pipe-insulation-reduction/pipe-insulation-reduction.component";
import { PowerFactorCorrectionComponent } from "../utilities/power-factor-correction/power-factor-correction.component";
import { PreAssessmentComponent } from "../utilities/pre-assessment/pre-assessment.component";
import { UnitConverterComponent } from "../utilities/unit-converter/unit-converter.component";
import { WaterReductionComponent } from "../utilities/water-reduction/water-reduction.component";
import { UtilitiesListComponent } from "../utilities/utilities-list/utilities-list.component";
import { SteamReductionComponent } from "../utilities/steam-reduction/steam-reduction.component";
import { TankInsulationReductionComponent } from "../utilities/tank-insulation-reduction/tank-insulation-reduction.component";

export const generalRoutes: Routes = [
    {
        path: '',
        component: UtilitiesListComponent
    },
    {
        path: 'cash-flow',
        component: CashFlowComponent
    },
    {
        path: 'co2-savings',
        component: Co2SavingsComponent
    },
    {
        path: 'combined-heat-power',
        component: CombinedHeatPowerComponent
    },
    {
        path: 'compressed-air-pressure-reduction',
        component: CompressedAirPressureReductionComponent
    },
    {
        path: 'compressed-air-reduction',
        component: CompressedAirReductionComponent
    },
    {
        path: 'electricity-reduction',
        component: ElectricityReductionComponent
    },
    {
        path: 'natural-gas-reduction',
        component: NaturalGasReductionComponent
    },
    {
        path: 'pipe-insulation-reduction',
        component: PipeInsulationReductionComponent
    },
    {
        path: 'power-factor-correction',
        component: PowerFactorCorrectionComponent
    },
    {
        path: 'pre-assessment',
        component: PreAssessmentComponent
    },
    {
        path: 'unit-converter',
        component: UnitConverterComponent
    },
    {
        path: 'water-reduction',
        component: WaterReductionComponent
    },
    {
        path: 'steam-reduction',
        component: SteamReductionComponent
    },
    {
        path: 'tank-insulation-reduction',
        component: TankInsulationReductionComponent
    }
]