import { Routes } from "@angular/router";
import { CashFlowComponent } from "../utilities/cash-flow/cash-flow.component";
import { Co2SavingsComponent } from "../utilities/co2-savings/co2-savings.component";
import { CombinedHeatPowerComponent } from "../utilities/combined-heat-power/combined-heat-power.component";
import { ElectricityReductionComponent } from "../utilities/electricity-reduction/electricity-reduction.component";
import { NaturalGasReductionComponent } from "../utilities/natural-gas-reduction/natural-gas-reduction.component";
import { PowerFactorCorrectionComponent } from "../utilities/power-factor-correction/power-factor-correction.component";
import { PreAssessmentComponent } from "../utilities/pre-assessment/pre-assessment.component";
import { UnitConverterComponent } from "../utilities/unit-converter/unit-converter.component";
import { WaterReductionComponent } from "../waste-water/water-reduction/water-reduction.component";
import { UtilitiesListComponent } from "../utilities/utilities-list/utilities-list.component";

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
        path: 'electricity-reduction',
        component: ElectricityReductionComponent
    },
    {
        path: 'natural-gas-reduction',
        component: NaturalGasReductionComponent
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
    }
]