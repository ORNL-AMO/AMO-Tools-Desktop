import { Routes } from '@angular/router';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { PhastComponent } from '../phast/phast.component';
import { PsatComponent } from '../psat/psat.component';
import { FsatComponent } from '../fsat/fsat.component';
import { SsmtComponent } from '../ssmt/ssmt.component';
import { TreasureHuntComponent } from '../treasure-hunt/treasure-hunt.component';
import { LandingScreenComponent } from '../dashboard/landing-screen/landing-screen.component';
import { TutorialsComponent } from '../tutorials/tutorials.component';
import { AboutPageComponent } from '../dashboard/about-page/about-page.component';
import { ContactPageComponent } from '../dashboard/contact-page/contact-page.component';
import { AcknowledgmentsPageComponent } from '../dashboard/acknowledgments-page/acknowledgments-page.component';
import { AssessmentSettingsComponent } from '../settings/assessment-settings/assessment-settings.component';
import { CustomMaterialsComponent } from '../suiteDb/custom-materials/custom-materials.component';
import { calculatorRoutes } from '../calculator/calculator-routing/calculators.routing';
import { CalculatorComponent } from '../calculator/calculator.component';
import { DirectoryDashboardComponent } from '../dashboard/directory-dashboard/directory-dashboard.component';
import { ReportRollupComponent } from '../report-rollup/report-rollup.component';
import { LogToolComponent } from '../log-tool/log-tool.component';
import { logToolRoutes } from '../log-tool/log-tool.routings';
import { CalculatorsListComponent } from '../calculator/calculators-list/calculators-list.component';
import { CompressedAirListComponent } from '../calculator/compressed-air/compressed-air-list/compressed-air-list.component';
import { FansListComponent } from '../calculator/fans/fans-list/fans-list.component';
import { FurnacesListComponent } from '../calculator/furnaces/furnaces-list/furnaces-list.component';
import { LightingListComponent } from '../calculator/lighting/lighting-list/lighting-list.component';
import { MotorsListComponent } from '../calculator/motors/motors-list/motors-list.component';
import { PumpsListComponent } from '../calculator/pumps/pumps-list/pumps-list.component';
import { SteamListComponent } from '../calculator/steam/steam-list/steam-list.component';
import { UtilitiesListComponent } from '../calculator/utilities/utilities-list/utilities-list.component';
import { AirVelocityComponent } from '../calculator/compressed-air/air-velocity/air-velocity.component';
import { BagMethodComponent } from '../calculator/compressed-air/bag-method/bag-method.component';
import { OperatingCostComponent } from '../calculator/compressed-air/operating-cost/operating-cost.component';
import { PipeSizingComponent } from '../calculator/compressed-air/pipe-sizing/pipe-sizing.component';
import { PneumaticAirComponent } from '../calculator/compressed-air/pneumatic-air/pneumatic-air.component';
import { ReceiverTankComponent } from '../calculator/compressed-air/receiver-tank/receiver-tank.component';
import { SystemCapacityComponent } from '../calculator/compressed-air/system-capacity/system-capacity.component';
import { FanAnalysisComponent } from '../calculator/fans/fan-analysis/fan-analysis.component';
import { FanEfficiencyComponent } from '../calculator/fans/fan-efficiency/fan-efficiency.component';
import { SystemAndEquipmentCurveComponent } from '../calculator/system-and-equipment-curve/system-and-equipment-curve.component';
import { CashFlowComponent } from '../calculator/utilities/cash-flow/cash-flow.component';
import { Co2SavingsComponent } from '../calculator/utilities/co2-savings/co2-savings.component';
import { CombinedHeatPowerComponent } from '../calculator/utilities/combined-heat-power/combined-heat-power.component';
import { ElectricityReductionComponent } from '../calculator/utilities/electricity-reduction/electricity-reduction.component';
import { NaturalGasReductionComponent } from '../calculator/utilities/natural-gas-reduction/natural-gas-reduction.component';
import { PipeInsulationReductionComponent } from '../calculator/steam/pipe-insulation-reduction/pipe-insulation-reduction.component';
import { PowerFactorCorrectionComponent } from '../calculator/utilities/power-factor-correction/power-factor-correction.component';
import { PreAssessmentComponent } from '../calculator/utilities/pre-assessment/pre-assessment.component';
import { UnitConverterComponent } from '../calculator/utilities/unit-converter/unit-converter.component';
import { WaterReductionComponent } from '../calculator/waste-water/water-reduction/water-reduction.component';
import { LightingReplacementComponent } from '../calculator/lighting/lighting-replacement/lighting-replacement.component';
import { MotorDriveComponent } from '../calculator/motors/motor-drive/motor-drive.component';
import { MotorPerformanceComponent } from '../calculator/motors/motor-performance/motor-performance.component';
import { NemaEnergyEfficiencyComponent } from '../calculator/motors/nema-energy-efficiency/nema-energy-efficiency.component';
import { PercentLoadEstimationComponent } from '../calculator/motors/percent-load-estimation/percent-load-estimation.component';
import { ReplaceExistingComponent } from '../calculator/motors/replace-existing/replace-existing.component';
import { EfficiencyImprovementComponent } from '../calculator/furnaces/efficiency-improvement/efficiency-improvement.component';
import { EnergyEquivalencyComponent } from '../calculator/furnaces/energy-equivalency/energy-equivalency.component';
import { EnergyUseComponent } from '../calculator/furnaces/energy-use/energy-use.component';
import { O2EnrichmentComponent } from '../calculator/furnaces/o2-enrichment/o2-enrichment.component';
import { AchievableEfficiencyComponent } from '../calculator/pumps/achievable-efficiency/achievable-efficiency.component';
import { HeadToolComponent } from '../calculator/pumps/head-tool/head-tool.component';
import { SpecificSpeedComponent } from '../calculator/pumps/specific-speed/specific-speed.component';
import { BoilerComponent } from '../calculator/steam/boiler/boiler.component';
import { BoilerBlowdownRateComponent } from '../calculator/steam/boiler-blowdown-rate/boiler-blowdown-rate.component';
import { DeaeratorComponent } from '../calculator/steam/deaerator/deaerator.component';
import { FlashTankComponent } from '../calculator/steam/flash-tank/flash-tank.component';
import { HeaderComponent } from '../calculator/steam/header/header.component';
import { HeatLossComponent } from '../calculator/steam/heat-loss/heat-loss.component';
import { PrvComponent } from '../calculator/steam/prv/prv.component';
import { SaturatedPropertiesComponent } from '../calculator/steam/saturated-properties/saturated-properties.component';
import { StackLossComponent } from '../calculator/steam/stack-loss/stack-loss.component';
import { SteamPropertiesComponent } from '../calculator/steam/steam-properties/steam-properties.component';
import { TurbineComponent } from '../calculator/steam/turbine/turbine.component';
import { TankInsulationReductionComponent } from '../calculator/steam/tank-insulation-reduction/tank-insulation-reduction.component';
import { AssessmentReportsComponent } from '../report-rollup/assessment-reports/assessment-reports.component';
import { AirLeakComponent } from '../calculator/compressed-air/air-leak/air-leak.component';
import { CompressedAirReductionComponent } from '../calculator/compressed-air/compressed-air-reduction/compressed-air-reduction.component';
import { CompressedAirPressureReductionComponent } from '../calculator/compressed-air/compressed-air-pressure-reduction/compressed-air-pressure-reduction.component';
import { SteamReductionComponent } from '../calculator/steam/steam-reduction/steam-reduction.component';
import { AirFlowConversionComponent } from '../calculator/compressed-air/air-flow-conversion/air-flow-conversion.component';
import { ProcessCoolingListComponent } from '../calculator/process-cooling/process-cooling-list/process-cooling-list.component';
import { CoolingTowerComponent } from '../calculator/process-cooling/cooling-tower/cooling-tower.component';
import { FanPsychrometricComponent } from '../calculator/process-cooling/fan-psychrometric/fan-psychrometric.component';
import { MotorInventoryComponent } from '../motor-inventory/motor-inventory.component';
import { motorInventoryRoutes } from '../motor-inventory/motor-inventory.routing';
import { WallComponent } from '../calculator/furnaces/wall/wall.component';
import { FlueGasComponent } from '../calculator/furnaces/flue-gas/flue-gas.component';
import { AtmosphereComponent } from '../calculator/furnaces/atmosphere/atmosphere.component';
import { ChargeMaterialComponent } from '../calculator/furnaces/charge-material/charge-material.component';
import { OpeningComponent } from '../calculator/furnaces/opening/opening.component';
import { AirHeatingComponent } from '../calculator/furnaces/air-heating/air-heating.component';
import { O2UtilizationRateComponent } from '../calculator/waste-water/o2-utilization-rate/o2-utilization-rate.component';
import { WasteWaterListComponent } from '../calculator/waste-water/waste-water-list/waste-water-list.component';
import { CoolingComponent } from '../calculator/furnaces/cooling/cooling.component';
import { LeakageComponent } from '../calculator/furnaces/leakage/leakage.component';
import { FixtureComponent } from '../calculator/furnaces/fixture/fixture.component';
import { WasteHeatComponent } from '../calculator/furnaces/waste-heat/waste-heat.component';
import { HeatCascadingComponent } from '../calculator/furnaces/heat-cascading/heat-cascading.component';
import { WasteWaterComponent } from '../waste-water/waste-water.component';
import { WaterHeatingComponent } from '../calculator/steam/water-heating/water-heating.component';
import { FanSystemChecklistComponent } from '../calculator/fans/fan-system-checklist/fan-system-checklist.component';
import { NotFoundComponent } from './not-found/not-found.component';


export const coreRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'landing-screen'
      },
      {
        path: 'landing-screen',
        component: LandingScreenComponent
      },
      {
        component: DirectoryDashboardComponent,
        path: 'directory-dashboard/:id',
      },
      {
        component: TutorialsComponent,
        path: 'tutorials'
      },
      {
        component: AboutPageComponent,
        path: 'about'
      },
      {
        component: ContactPageComponent,
        path: 'contact'
      },
      {
        component: AcknowledgmentsPageComponent,
        path: 'acknowledgments'
      },
      {
        component: AssessmentSettingsComponent,
        path: 'settings'
      },
      {
        component: CustomMaterialsComponent,
        path: 'custom-materials'
      },
      {
        component: CalculatorComponent,
        path: 'calculators',
        children: [
          {
            path: 'calculators-list',
            component: CalculatorsListComponent
          },
          {
            path: 'compressed-air-list',
            component: CompressedAirListComponent
          },
          {
            path: 'fans-list',
            component: FansListComponent
          },
          {
            path: 'process-heating-list',
            component: FurnacesListComponent
          },
          {
            path: 'process-cooling-list',
            component: ProcessCoolingListComponent
          },
          {
            path: 'lighting-list',
            component: LightingListComponent
          },
          {
            path: 'motors-list',
            component: MotorsListComponent
          },
          {
            path: 'pumps-list',
            component: PumpsListComponent
          },
          {
            path: 'steam-list',
            component: SteamListComponent
          },
          {
            path: 'general-list',
            component: UtilitiesListComponent
          },
          {
            path: 'air-velocity',
            component: AirVelocityComponent
          },
          {
            path: 'air-flow-conversion',
            component: AirFlowConversionComponent
          },
          {
            path: 'bag-method',
            component: BagMethodComponent
          },
          {
            path: 'operating-cost',
            component: OperatingCostComponent
          },
          {
            path: 'pipe-sizing',
            component: PipeSizingComponent
          },
          {
            path: 'pneumatic-air',
            component: PneumaticAirComponent
          },
          {
            path: 'receiver-tank-usable-air',
            component: ReceiverTankComponent
          },
          {
            path: 'receiver-tank',
            component: ReceiverTankComponent
          },
          {
            path: 'system-capacity',
            component: SystemCapacityComponent
          },
          {
            path: 'air-leak',
            component: AirLeakComponent
          },
          {
            path: 'fan-psychrometric',
            component: FanPsychrometricComponent
          },
          {
            path: 'fan-analysis',
            component: FanAnalysisComponent
          },
          {
            path: 'fan-system-checklist',
            component: FanSystemChecklistComponent
          },
          {
            path: 'fan-efficiency',
            component: FanEfficiencyComponent
          },
          {
            path: 'fan-curve',
            component: SystemAndEquipmentCurveComponent
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
            path: 'water-heating',
            component: WaterHeatingComponent
          },
          {
            path: 'steam-reduction',
            component: SteamReductionComponent
          },
          {
            path: 'lighting-replacement',
            component: LightingReplacementComponent
          },
          {
            path: 'motor-drive',
            component: MotorDriveComponent
          },
          {
            path: 'motor-performance',
            component: MotorPerformanceComponent
          },
          {
            path: 'nema-energy-efficiency',
            component: NemaEnergyEfficiencyComponent
          },
          {
            path: 'percent-load-estimation',
            component: PercentLoadEstimationComponent
          },
          {
            path: 'replace-existing',
            component: ReplaceExistingComponent
          },
          {
            path: 'efficiency-improvement',
            component: EfficiencyImprovementComponent
          },
          {
            path: 'energy-equivalency',
            component: EnergyEquivalencyComponent
          },
          {
            path: 'energy-use',
            component: EnergyUseComponent
          },
          {
            path: 'o2-enrichment',
            component: O2EnrichmentComponent
          },
          {
            path: 'atmosphere',
            component: AtmosphereComponent
          },
          {
            path: 'cooling',
            component: CoolingComponent
          },
          {
            path: 'wall-loss',
            component: WallComponent
          },
          {
            path: 'opening',
            component: OpeningComponent
          },
          {
            path: 'heat-cascading',
            component: HeatCascadingComponent
          },
          {
            path: 'flue-gas',
            component: FlueGasComponent
          },
          {
            path: 'air-heating',
            component: AirHeatingComponent
          },
          {
            path: 'waste-heat',
            component: WasteHeatComponent
          },
          {
            path: 'charge-material',
            component: ChargeMaterialComponent
          },
          {
            path: 'leakage',
            component: LeakageComponent
          },
          {
            path: 'fixture',
            component: FixtureComponent
          },
          {
            path: 'achievable-efficiency',
            component: AchievableEfficiencyComponent
          },
          {
            path: 'head-tool',
            component: HeadToolComponent
          },
          {
            path: 'specific-speed',
            component: SpecificSpeedComponent
          },
          {
            path: 'pump-curve',
            component: SystemAndEquipmentCurveComponent
          },
          {
            path: 'boiler',
            component: BoilerComponent
          },
          {
            path: 'boiler-blowdown-rate',
            component: BoilerBlowdownRateComponent
          },
          {
            path: 'deaerator',
            component: DeaeratorComponent
          },
          {
            path: 'flash-tank',
            component: FlashTankComponent
          },
          {
            path: 'header',
            component: HeaderComponent
          },
          {
            path: 'heat-loss',
            component: HeatLossComponent
          },
          {
            path: 'prv',
            component: PrvComponent
          },
          {
            path: 'saturated-properties',
            component: SaturatedPropertiesComponent
          },
          {
            path: 'stack-loss',
            component: StackLossComponent
          },
          {
            path: 'steam-properties',
            component: SteamPropertiesComponent
          },
          {
            path: 'turbine',
            component: TurbineComponent
          },
          {
            path: 'tank-insulation-reduction',
            component: TankInsulationReductionComponent
          },
          {
            path: 'cooling-tower',
            component: CoolingTowerComponent
          },
          {
            path: 'waste-water-list',
            component: WasteWaterListComponent
          },
          {
            path: 'o2-utilization-rate',
            component: O2UtilizationRateComponent
          }
        ]
      }
    ]
  },
  {
    path: 'dashboard',
    pathMatch: 'full',
    redirectTo: ''
  },
  {
    path: 'phast/:id',
    component: PhastComponent
  },
  {
    path: 'psat/:id',
    component: PsatComponent
  },
  {
    path: 'fsat/:id',
    component: FsatComponent
  },
  {
    path: 'ssmt/:id',
    component: SsmtComponent
  },
  {
    path: 'treasure-hunt/:id',
    component: TreasureHuntComponent
  },
  {
    path: 'report-rollup',
    component: ReportRollupComponent,
    children: [
      {
        path: '',
        component: AssessmentReportsComponent
      },
    ]
  },
  {
    path: 'log-tool',
    component: LogToolComponent,
    children: logToolRoutes
  },
  {
    component: MotorInventoryComponent,
    path: 'motor-inventory/:id',
    children: motorInventoryRoutes
  },
  {
    component: WasteWaterComponent,
    path: 'waste-water/:id',
  },
  { 
    path: '**', 
    component: NotFoundComponent 
  },  

];
