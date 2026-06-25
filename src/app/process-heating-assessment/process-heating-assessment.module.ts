import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Route, RouterModule } from '@angular/router';
import { FormControlErrorsComponent } from '../shared/form-control-errors.component';
import { InputUnitComponent } from '../shared/input-unit.component';
import { SettingsModule } from '../settings/settings.module';
import { Co2SavingsPhastModule } from '../phast/losses/operations/co2-savings-phast/co2-savings-phast.module';
import { OperatingHoursModule } from '../shared/operating-hours/operating-hours.module';
import { PhastOperatingCostsModule } from '../shared/phast-operating-costs/phast-operating-costs.module';
import { SharedPipesModule } from '../shared/shared-pipes/shared-pipes.module';

import { ROUTE_TOKENS } from './constants/process-heating-routes';
import { ProcessHeatingUiService } from './services/process-heating-ui.service';
import { ProcessHeatingAssessmentService } from './services/process-heating-assessment.service';
import { ProcessHeatingOperationsFormService } from './services/process-heating-operations-form.service';
import { ProcessHeatingResultsService } from './services/process-heating-results.service';
import { ProcessHeatingAssessmentResolver } from './routing/process-heating-assessment.resolver';
import { ConvertPhastService } from '../phast/convert-phast.service';
import { PhastService } from '../phast/phast.service';
import { PhastResultsService } from '../phast/phast-results.service';
import { AuxEquipmentService } from '../phast/aux-equipment/aux-equipment.service';
import { AuxiliaryPowerLossesService } from '../phast/losses/auxiliary-power-losses/auxiliary-power-losses.service';
import { OtherLossesService } from '../phast/losses/other-losses/other-losses.service';
import { SlagService } from '../phast/losses/slag/slag.service';
import { ExhaustGasService } from '../phast/losses/exhaust-gas/exhaust-gas.service';
import { EnergyInputExhaustGasService } from '../phast/losses/energy-input-exhaust-gas-losses/energy-input-exhaust-gas.service';
import { EnergyInputService } from '../phast/losses/energy-input/energy-input.service';
import { Co2SavingsPhastService } from '../phast/losses/operations/co2-savings-phast/co2-savings-phast.service';
import { AtmosphereFormService } from '../calculator/furnaces/atmosphere/atmosphere-form.service';
import { WallFormService } from '../calculator/furnaces/wall/wall-form.service';
import { LeakageFormService } from '../calculator/furnaces/leakage/leakage-form.service';
import { FixtureFormService } from '../calculator/furnaces/fixture/fixture-form.service';
import { OpeningFormService } from '../calculator/furnaces/opening/opening-form.service';
import { CoolingFormService } from '../calculator/furnaces/cooling/cooling-form.service';
import { FlueGasFormService } from '../calculator/furnaces/flue-gas/flue-gas-form.service';

import { ResultsPanelComponent } from './results-panel/results-panel.component';
import { AssessmentResultsComponent } from './results-panel/assessment-results/assessment-results.component';
import { HelpPanelComponent } from './results-panel/help-panel/help-panel.component';

import { ProcessHeatingAssessmentComponent } from './process-heating-assessment/process-heating-assessment.component';
import { ProcessHeatingBannerComponent } from './process-heating-banner/process-heating-banner.component';
import { BaselineComponent } from './baseline/baseline.component';
import { BaselineTabsComponent } from './baseline/baseline-tabs/baseline-tabs.component';
import { AssessmentComponent } from './assessment/assessment.component';
import { ExploreOpportunitiesComponent } from './explore-opportunities/explore-opportunities.component';
import { ReportComponent } from './report/report.component';
import { ExecutiveSummaryComponent } from './report/executive-summary/executive-summary.component';
import { InputSummaryComponent } from './report/input-summary/input-summary.component';
import { FacilityInfoComponent } from './report/facility-info/facility-info.component';
import { AssessmentSettingsComponent } from './assessment-settings/assessment-settings.component';
import { OperationsComponent } from './operations/operations.component';
import { HeatBalanceComponent } from './heat-balance/heat-balance.component';
import { HeatBalanceLossTabsComponent } from './heat-balance/heat-balance-loss-tabs/heat-balance-loss-tabs.component';
import { AuxiliaryEquipmentComponent } from './auxiliary-equipment/auxiliary-equipment.component';
import { DesignedEnergyComponent } from './designed-energy/designed-energy.component';
import { MeteredEnergyComponent } from './metered-energy/metered-energy.component';

import { ChargeMaterialComponent } from './heat-balance/losses/charge-material/charge-material.component';
import { ChargeMaterialSolidFormComponent } from './heat-balance/losses/charge-material/solid-form/charge-material-solid-form.component';
import { ChargeMaterialLiquidFormComponent } from './heat-balance/losses/charge-material/liquid-form/charge-material-liquid-form.component';
import { ChargeMaterialGasFormComponent } from './heat-balance/losses/charge-material/gas-form/charge-material-gas-form.component';
import { WallLossesComponent } from './heat-balance/losses/wall-losses/wall-losses.component';
import { WallLossesFormComponent } from './heat-balance/losses/wall-losses/wall-losses-form.component';
import { ExtendedSurfaceComponent } from './heat-balance/losses/extended-surface/extended-surface.component';
import { ExtendedSurfaceFormComponent } from './heat-balance/losses/extended-surface/extended-surface-form.component';
import { AtmosphereComponent } from './heat-balance/losses/atmosphere/atmosphere.component';
import { FixtureComponent } from './heat-balance/losses/fixture/fixture.component';
import { CoolingComponent } from './heat-balance/losses/cooling/cooling.component';
import { OpeningComponent } from './heat-balance/losses/opening/opening.component';
import { OtherComponent } from './heat-balance/losses/other/other.component';
import { FlueGasComponent } from './heat-balance/losses/flue-gas/flue-gas.component';
import { GasLeakageComponent } from './heat-balance/losses/gas-leakage/gas-leakage.component';
import { AuxiliaryPowerComponent } from './heat-balance/losses/auxiliary-power/auxiliary-power.component';
import { EnergyInputExhaustGasComponent } from './heat-balance/losses/energy-input-exhaust-gas/energy-input-exhaust-gas.component';
import { EnergyInputComponent } from './heat-balance/losses/energy-input/energy-input.component';
import { ExhaustGasComponent } from './heat-balance/losses/exhaust-gas/exhaust-gas.component';
import { SlagComponent } from './heat-balance/losses/slag/slag.component';
import { HeatSystemEfficiencyComponent } from './heat-balance/losses/heat-system-efficiency/heat-system-efficiency.component';

const ROUTES: Route[] = [
  {
    path: '',
    component: ProcessHeatingAssessmentComponent,
    resolve: { data: ProcessHeatingAssessmentResolver },
    children: [
      { path: '', redirectTo: ROUTE_TOKENS.baseline, pathMatch: 'full' },
      {
        path: ROUTE_TOKENS.baseline,
        component: BaselineComponent,
        data: { mainView: ROUTE_TOKENS.baseline },
        children: [
          { path: '', redirectTo: ROUTE_TOKENS.assessmentSettings, pathMatch: 'full' },
          {
            path: ROUTE_TOKENS.assessmentSettings,
            component: AssessmentSettingsComponent,
            data: { childView: ROUTE_TOKENS.assessmentSettings, stepIndex: 0 },
          },
          {
            path: ROUTE_TOKENS.heatBalance,
            component: HeatBalanceComponent,
            data: { childView: ROUTE_TOKENS.heatBalance },
            children: [
              { path: '', redirectTo: ROUTE_TOKENS.operations, pathMatch: 'full' },
              {
                path: ROUTE_TOKENS.operations,
                component: OperationsComponent,
                data: { lossSubView: ROUTE_TOKENS.operations, stepIndex: 1 },
              },
              {
                path: ROUTE_TOKENS.chargeMaterial,
                component: ChargeMaterialComponent,
                data: { lossSubView: ROUTE_TOKENS.chargeMaterial, stepIndex: 2 },
              },
              {
                path: ROUTE_TOKENS.wallLosses,
                component: WallLossesComponent,
                data: { lossSubView: ROUTE_TOKENS.wallLosses, stepIndex: 3 },
              },
              {
                path: ROUTE_TOKENS.extendedSurface,
                component: ExtendedSurfaceComponent,
                data: { lossSubView: ROUTE_TOKENS.extendedSurface, stepIndex: 4 },
              },
              {
                path: ROUTE_TOKENS.atmosphere,
                component: AtmosphereComponent,
                data: { lossSubView: ROUTE_TOKENS.atmosphere, stepIndex: 5 },
              },
              {
                path: ROUTE_TOKENS.fixture,
                component: FixtureComponent,
                data: { lossSubView: ROUTE_TOKENS.fixture, stepIndex: 6 },
              },
              {
                path: ROUTE_TOKENS.cooling,
                component: CoolingComponent,
                data: { lossSubView: ROUTE_TOKENS.cooling, stepIndex: 7 },
              },
              {
                path: ROUTE_TOKENS.opening,
                component: OpeningComponent,
                data: { lossSubView: ROUTE_TOKENS.opening, stepIndex: 8 },
              },
              {
                path: ROUTE_TOKENS.other,
                component: OtherComponent,
                data: { lossSubView: ROUTE_TOKENS.other, stepIndex: 9 },
              },
              {
                path: ROUTE_TOKENS.flueGas,
                component: FlueGasComponent,
                data: { lossSubView: ROUTE_TOKENS.flueGas, stepIndex: 10 },
              },
              {
                path: ROUTE_TOKENS.gasLeakage,
                component: GasLeakageComponent,
                data: { lossSubView: ROUTE_TOKENS.gasLeakage, stepIndex: 11 },
              },
              {
                path: ROUTE_TOKENS.auxiliaryPower,
                component: AuxiliaryPowerComponent,
                data: { lossSubView: ROUTE_TOKENS.auxiliaryPower, stepIndex: 12 },
              },
              {
                path: ROUTE_TOKENS.energyInputExhaustGas,
                component: EnergyInputExhaustGasComponent,
                data: { lossSubView: ROUTE_TOKENS.energyInputExhaustGas, stepIndex: 13 },
              },
              {
                path: ROUTE_TOKENS.energyInput,
                component: EnergyInputComponent,
                data: { lossSubView: ROUTE_TOKENS.energyInput, stepIndex: 14 },
              },
              {
                path: ROUTE_TOKENS.exhaustGas,
                component: ExhaustGasComponent,
                data: { lossSubView: ROUTE_TOKENS.exhaustGas, stepIndex: 15 },
              },
              {
                path: ROUTE_TOKENS.slag,
                component: SlagComponent,
                data: { lossSubView: ROUTE_TOKENS.slag, stepIndex: 16 },
              },
              {
                path: ROUTE_TOKENS.heatSystemEfficiency,
                component: HeatSystemEfficiencyComponent,
                data: { lossSubView: ROUTE_TOKENS.heatSystemEfficiency, stepIndex: 17 },
              },
            ]
          },
          {
            path: ROUTE_TOKENS.auxiliaryEquipment,
            component: AuxiliaryEquipmentComponent,
            data: { childView: ROUTE_TOKENS.auxiliaryEquipment, stepIndex: 18 },
          },
          {
            path: ROUTE_TOKENS.designedEnergy,
            component: DesignedEnergyComponent,
            data: { childView: ROUTE_TOKENS.designedEnergy, stepIndex: 19 },
          },
          {
            path: ROUTE_TOKENS.meteredEnergy,
            component: MeteredEnergyComponent,
            data: { childView: ROUTE_TOKENS.meteredEnergy, stepIndex: 20 },
          },
        ]
      },
      {
        path: ROUTE_TOKENS.assessment,
        component: AssessmentComponent,
        data: { mainView: ROUTE_TOKENS.assessment },
        children: [
          { path: '', redirectTo: ROUTE_TOKENS.exploreOpportunities, pathMatch: 'full' },
          {
            path: ROUTE_TOKENS.exploreOpportunities,
            component: ExploreOpportunitiesComponent,
            data: { childView: ROUTE_TOKENS.exploreOpportunities, stepIndex: 21 },
          },
        ]
      },
      {
        path: ROUTE_TOKENS.report,
        component: ReportComponent,
        data: { mainView: ROUTE_TOKENS.report, stepIndex: 22 },
        children: [
          { path: '', redirectTo: ROUTE_TOKENS.executiveSummary, pathMatch: 'full' },
          {
            path: ROUTE_TOKENS.executiveSummary,
            component: ExecutiveSummaryComponent,
            data: { childView: ROUTE_TOKENS.executiveSummary },
          },
          {
            path: ROUTE_TOKENS.inputSummary,
            component: InputSummaryComponent,
            data: { childView: ROUTE_TOKENS.inputSummary },
          },
          {
            path: ROUTE_TOKENS.facilityInfo,
            component: FacilityInfoComponent,
            data: { childView: ROUTE_TOKENS.facilityInfo },
          },
        ]
      },
    ]
  }
];

@NgModule({
  declarations: [
    ProcessHeatingAssessmentComponent,
    ProcessHeatingBannerComponent,
    ResultsPanelComponent,
    AssessmentResultsComponent,
    HelpPanelComponent,
    BaselineComponent,
    BaselineTabsComponent,
    AssessmentComponent,
    ExploreOpportunitiesComponent,
    ReportComponent,
    ExecutiveSummaryComponent,
    InputSummaryComponent,
    FacilityInfoComponent,
    AssessmentSettingsComponent,
    OperationsComponent,
    HeatBalanceComponent,
    HeatBalanceLossTabsComponent,
    AuxiliaryEquipmentComponent,
    DesignedEnergyComponent,
    MeteredEnergyComponent,
    ChargeMaterialComponent,
    ChargeMaterialSolidFormComponent,
    ChargeMaterialLiquidFormComponent,
    ChargeMaterialGasFormComponent,
    WallLossesComponent,
    WallLossesFormComponent,
    ExtendedSurfaceComponent,
    ExtendedSurfaceFormComponent,
    AtmosphereComponent,
    FixtureComponent,
    CoolingComponent,
    OpeningComponent,
    OtherComponent,
    FlueGasComponent,
    GasLeakageComponent,
    AuxiliaryPowerComponent,
    EnergyInputExhaustGasComponent,
    EnergyInputComponent,
    ExhaustGasComponent,
    SlagComponent,
    HeatSystemEfficiencyComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(ROUTES),
    FormControlErrorsComponent,
    InputUnitComponent,
    SettingsModule,
    Co2SavingsPhastModule,
    OperatingHoursModule,
    PhastOperatingCostsModule,
    SharedPipesModule,
  ],
  providers: [
    ProcessHeatingUiService,
    ProcessHeatingAssessmentService,
    ProcessHeatingOperationsFormService,
    ProcessHeatingResultsService,
    ProcessHeatingAssessmentResolver,
    ConvertPhastService,
    // PHAST bridge — temporary delegation layer used by ProcessHeatingResultsService until
    // each loss form is rebuilt (Steps 6–13). Remove each service as its loss form migrates.
    PhastService,
    PhastResultsService,
    AuxEquipmentService,
    AuxiliaryPowerLossesService,
    OtherLossesService,
    SlagService,
    ExhaustGasService,
    EnergyInputExhaustGasService,
    EnergyInputService,
    Co2SavingsPhastService,
    AtmosphereFormService,
    WallFormService,
    LeakageFormService,
    FixtureFormService,
    OpeningFormService,
    CoolingFormService,
    FlueGasFormService,
  ]
})
export class ProcessHeatingAssessmentModule {}
