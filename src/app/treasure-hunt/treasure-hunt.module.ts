import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreasureHuntComponent } from './treasure-hunt.component';
import { TreasureHuntBannerComponent } from './treasure-hunt-banner/treasure-hunt-banner.component';
import { FindTreasureComponent } from './find-treasure/find-treasure.component';
import { TreasureHuntService } from './treasure-hunt.service';
import { LightingReplacementModule } from '../calculator/lighting/lighting-replacement/lighting-replacement.module';
import { SystemBasicsComponent } from './system-basics/system-basics.component';
import { SettingsModule } from '../settings/settings.module';
import { HelpPanelComponent } from './help-panel/help-panel.component';
import { ModalModule } from 'ngx-bootstrap';
import { FormsModule } from '@angular/forms';
import { TreasureChestComponent } from './treasure-chest/treasure-chest.component';
import { SummaryCardComponent } from './treasure-chest/summary-card/summary-card.component';
import { LightingReplacementCardComponent } from './treasure-chest/lighting-replacement-card/lighting-replacement-card.component';
import { OpportunitySheetComponent } from './opportunity-sheet/opportunity-sheet.component';
import { StandaloneOpportunitySheetComponent } from './standalone-opportunity-sheet/standalone-opportunity-sheet.component';
import { EnergyUseFormComponent } from './standalone-opportunity-sheet/energy-use-form/energy-use-form.component';
import { CostsFormComponent } from './opportunity-sheet/costs-form/costs-form.component';
import { GeneralDetailsFormComponent } from './opportunity-sheet/general-details-form/general-details-form.component';
import { OpportunitySheetHelpComponent } from './standalone-opportunity-sheet/opportunity-sheet-help/opportunity-sheet-help.component';
import { OpportunitySheetResultsComponent } from './standalone-opportunity-sheet/opportunity-sheet-results/opportunity-sheet-results.component';
import { OpportunitySheetCardComponent } from './treasure-chest/opportunity-sheet-card/opportunity-sheet-card.component';
import { OpportunitySheetService } from './standalone-opportunity-sheet/opportunity-sheet.service';

@NgModule({
  imports: [
    CommonModule,
    LightingReplacementModule,
    SettingsModule,
    ModalModule,
    FormsModule
  ],
  declarations: [TreasureHuntComponent, TreasureHuntBannerComponent, FindTreasureComponent, SystemBasicsComponent, HelpPanelComponent, TreasureChestComponent, SummaryCardComponent, LightingReplacementCardComponent, OpportunitySheetComponent, StandaloneOpportunitySheetComponent, EnergyUseFormComponent, CostsFormComponent, GeneralDetailsFormComponent, OpportunitySheetHelpComponent, OpportunitySheetResultsComponent, OpportunitySheetCardComponent],
  providers: [ TreasureHuntService, OpportunitySheetService ]
})
export class TreasureHuntModule { }
