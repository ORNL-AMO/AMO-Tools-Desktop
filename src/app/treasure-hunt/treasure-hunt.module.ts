import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreasureHuntComponent } from './treasure-hunt.component';
import { TreasureHuntBannerComponent } from './treasure-hunt-banner/treasure-hunt-banner.component';
import { FindTreasureComponent } from './find-treasure/find-treasure.component';
import { TreasureHuntService } from './treasure-hunt.service';
import { SystemBasicsComponent } from './system-basics/system-basics.component';
import { SettingsModule } from '../settings/settings.module';
import { HelpPanelComponent } from './help-panel/help-panel.component';
import { ModalModule } from 'ngx-bootstrap';
import { FormsModule } from '@angular/forms';
import { TreasureChestComponent } from './treasure-chest/treasure-chest.component';
import { SummaryCardComponent } from './treasure-chest/summary-card/summary-card.component';
import { OperationCostsComponent } from './operation-costs/operation-costs.component';
import { TreasureHuntReportService } from './treasure-hunt-report/treasure-hunt-report.service';
import { OpportunityCardsComponent } from './treasure-chest/opportunity-cards/opportunity-cards.component';
import { OpportunityCardsService } from './treasure-chest/opportunity-cards/opportunity-cards.service';
import { CalculatorsModule } from './calculators/calculators.module';
import { TreasureHuntReportModule } from './treasure-hunt-report/treasure-hunt-report.module';
import { SortCardsByPipe } from './treasure-chest/opportunity-cards/sort-cards-by.pipe';
import { UtilitySummaryComponent } from './treasure-chest/summary-card/utility-summary/utility-summary.component';
import { SortCardsService } from './treasure-chest/opportunity-cards/sort-cards.service';
import { TreasureHuntGaugeComponent } from './treasure-hunt-gauge/treasure-hunt-gauge.component';
import { AnimatedCheckmarkModule } from '../shared/animated-checkmark/animated-checkmark.module';
import { OperatingHoursModalModule } from '../shared/operating-hours-modal/operating-hours-modal.module';
import { ToastModule } from '../shared/toast/toast.module';
import { ConvertInputDataService } from './convert-input-data.service';
import { RouterModule } from '@angular/router';
import { TreasureChestMenuModule } from './treasure-chest/treasure-chest-menu/treasure-chest-menu.module';
import { UpdateUnitsModalModule } from '../shared/update-units-modal/update-units-modal.module';
import { AirLeakTreasureHuntService } from './treasure-hunt-calculator-services/air-leak-treasure-hunt.service';
import { CaPressureReductionTreasureHuntService } from './treasure-hunt-calculator-services/ca-pressure-reduction-treasure-hunt.service';
import { WaterReductionTreasureHuntService } from './treasure-hunt-calculator-services/water-reduction-treasure-hunt.service';
import { StandaloneOpportunitySheetService } from './treasure-hunt-calculator-services/standalone-opportunity-sheet.service';
import { CaReductionTreasureHuntService } from './treasure-hunt-calculator-services/ca-reduction-treasure-hunt.service';
import { ElectricityReductionTreasureHuntService } from './treasure-hunt-calculator-services/electricity-reduction-treasure-hunt.service';
import { LightingReplacementTreasureHuntService } from './treasure-hunt-calculator-services/lighting-replacement-treasure-hunt.service';
import { MotorDriveTreasureHuntService } from './treasure-hunt-calculator-services/motor-drive-treasure-hunt.service';
import { NaturalGasReductionTreasureHuntService } from './treasure-hunt-calculator-services/natural-gas-reduction-treasure-hunt.service';
import { PipeInsulationTreasureHuntService } from './treasure-hunt-calculator-services/pipe-insulation-treasure-hunt.service';
import { ReplaceExistingTreasureHuntService } from './treasure-hunt-calculator-services/replace-existing-treasure-hunt.service';
import { SteamReductionTreasureHuntService } from './treasure-hunt-calculator-services/steam-reduction-treasure-hunt.service';
import { TankInsulationTreasureHuntService } from './treasure-hunt-calculator-services/tank-insulation-treasure-hunt.service';
import { TreasureHuntOpportunityService } from './treasure-hunt-calculator-services/treasure-hunt-opportunity.service';
import { FlueGasTreasureHuntService } from './treasure-hunt-calculator-services/flue-gas-treasure-hunt.service';
import { WallTreasureHuntService } from './treasure-hunt-calculator-services/wall-treasure-hunt.service';
import { LeakageTreasureHuntService } from './treasure-hunt-calculator-services/leakage-treasure-hunt.service';
import { WasteHeatTreasureHuntService } from './treasure-hunt-calculator-services/waste-heat-treasure-hunt.service';
import { OpeningTreasureHuntService } from './treasure-hunt-calculator-services/opening-treasure-hunt.service';
import { AirHeatingTreasureHuntService } from './treasure-hunt-calculator-services/air-heating-treasure-hunt.service';
import { HeatCascadingTreasureHuntService } from './treasure-hunt-calculator-services/heat-cascading-treasure-hunt.service';
import { WaterHeatingTreasureHuntService } from './treasure-hunt-calculator-services/water-heating-treasure-hunt.service';
import { AssessmentCo2SavingsModule } from '../shared/assessment-co2-savings/assessment-co2-savings.module';

@NgModule({
  imports: [
    CommonModule,
    SettingsModule,
    ModalModule,
    FormsModule,
    CalculatorsModule,
    TreasureHuntReportModule,
    AnimatedCheckmarkModule,
    OperatingHoursModalModule,
    ToastModule,
    RouterModule,
    TreasureChestMenuModule,
    UpdateUnitsModalModule,
    AssessmentCo2SavingsModule
  ],
  declarations: [
    TreasureHuntComponent, 
    TreasureHuntBannerComponent, 
    FindTreasureComponent, 
    SystemBasicsComponent, 
    HelpPanelComponent, 
    TreasureChestComponent, 
    SummaryCardComponent, 
    OperationCostsComponent, 
    OpportunityCardsComponent,
    SortCardsByPipe,
    UtilitySummaryComponent,
    TreasureHuntGaugeComponent
  ],
  providers: [ 
    TreasureHuntService, 
    TreasureHuntReportService,
    OpportunityCardsService, 
    SortCardsService,
    ConvertInputDataService,
    AirLeakTreasureHuntService,
    TankInsulationTreasureHuntService,
    StandaloneOpportunitySheetService,
    LightingReplacementTreasureHuntService,
    ReplaceExistingTreasureHuntService,
    MotorDriveTreasureHuntService,
    NaturalGasReductionTreasureHuntService,
    ElectricityReductionTreasureHuntService,
    CaReductionTreasureHuntService,
    CaPressureReductionTreasureHuntService,
    WaterReductionTreasureHuntService,
    SteamReductionTreasureHuntService,
    PipeInsulationTreasureHuntService,
    TreasureHuntOpportunityService,
    WasteHeatTreasureHuntService,
    AirHeatingTreasureHuntService,
    WallTreasureHuntService,
    LeakageTreasureHuntService,
    FlueGasTreasureHuntService,
    OpeningTreasureHuntService,
    HeatCascadingTreasureHuntService,
    WaterHeatingTreasureHuntService
  ]
})
export class TreasureHuntModule { }
