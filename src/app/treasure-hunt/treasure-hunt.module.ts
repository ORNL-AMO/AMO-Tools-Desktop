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
import { ImportOpportunitiesService } from './treasure-chest/import-opportunities.service';
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
    UpdateUnitsModalModule
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
    ConvertInputDataService
  ]
})
export class TreasureHuntModule { }
