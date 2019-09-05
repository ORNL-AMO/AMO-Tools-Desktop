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
import { SharedModule } from '../shared/shared.module';
import { TreasureChestMenuComponent } from './treasure-chest/treasure-chest-menu/treasure-chest-menu.component';
import { TreasureHuntReportService } from './treasure-hunt-report/treasure-hunt-report.service';
import { ImportExportOpportunitiesComponent } from './treasure-chest/import-export-opportunities/import-export-opportunities.component';
import { ImportOpportunitiesService } from './treasure-chest/import-opportunities.service';
import { OpportunityCardsComponent } from './treasure-chest/opportunity-cards/opportunity-cards.component';
import { OpportunityCardsService } from './treasure-chest/opportunity-cards/opportunity-cards.service';
import { CalculatorsModule } from './calculators/calculators.module';
import { TreasureHuntReportModule } from './treasure-hunt-report/treasure-hunt-report.module';
import { TreasureChestMenuService } from './treasure-chest/treasure-chest-menu/treasure-chest-menu.service';
import { SortCardsByPipe } from './treasure-chest/opportunity-cards/sort-cards-by.pipe';

@NgModule({
  imports: [
    CommonModule,
    SettingsModule,
    ModalModule,
    FormsModule,
    SharedModule,
    CalculatorsModule,
    TreasureHuntReportModule
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
    TreasureChestMenuComponent,
    ImportExportOpportunitiesComponent,
    OpportunityCardsComponent,
    SortCardsByPipe
  ],
  providers: [ TreasureHuntService, TreasureHuntReportService, ImportOpportunitiesService, OpportunityCardsService, TreasureChestMenuService ]
})
export class TreasureHuntModule { }
