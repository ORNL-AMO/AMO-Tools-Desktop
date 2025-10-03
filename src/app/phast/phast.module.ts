import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { MeteredEnergyModule } from './metered-energy/metered-energy.module';
import { LossesModule } from './losses/losses.module';
import { DesignedEnergyModule } from './designed-energy/designed-energy.module';
import { PhastComponent } from './phast.component';
import { PhastBannerComponent } from './phast-banner/phast-banner.component';

import { SystemBasicsComponent } from './system-basics/system-basics.component';
import { PhastTabsComponent } from './phast-tabs/phast-tabs.component';
import { HelpPanelComponent } from './help-panel/help-panel.component';

import { PhastService } from './phast.service';
import { SettingsModule } from '../settings/settings.module';
import { AuxEquipmentModule } from './aux-equipment/aux-equipment.module';
import { PhastReportModule } from './phast-report/phast-report.module';
import { PhastDiagramComponent } from './phast-diagram/phast-diagram.component';
import { PhastResultsService } from './phast-results.service';
import { ConvertPhastService } from './convert-phast.service';
import { PhastCalculatorTabsComponent } from './phast-calculator-tabs/phast-calculator-tabs.component';
import { PreAssessmentModule } from '../calculator/utilities/pre-assessment/pre-assessment.module';
import { O2EnrichmentModule } from '../calculator/furnaces/o2-enrichment/o2-enrichment.module';
import { EfficiencyImprovementModule } from '../calculator/furnaces/efficiency-improvement/efficiency-improvement.module';
import { EnergyEquivalencyModule } from '../calculator/furnaces/energy-equivalency/energy-equivalency.module';
import { EnergyUseModule } from '../calculator/furnaces/energy-use/energy-use.module';
import { ExplorePhastOpportunitiesModule } from './explore-phast-opportunities/explore-phast-opportunities.module';
import { LossesTabsModule } from './losses/losses-tabs/losses-tabs.module';
import { PhastCompareService } from './phast-compare.service';
import { ModificationNavbarComponent } from './modification-navbar/modification-navbar.component';
import { ModificationListComponent } from './modification-list/modification-list.component';
import { AddModificationComponent } from './add-modification/add-modification.component';
import { UtilitiesModule } from '../calculator/utilities/utilities.module';
import { TabsTooltipModule } from '../shared/tabs-tooltip/tabs-tooltip.module';
import { UnitConverterModule } from '../calculator/utilities/unit-converter/unit-converter.module';
import { PhastValidService } from './phast-valid.service';
import { FlueGasModule } from '../calculator/furnaces/flue-gas/flue-gas.module';
import { PhastSankeyModule } from '../shared/phast-sankey/phast-sankey.module';
import { UpdateUnitsModalModule } from '../shared/update-units-modal/update-units-modal.module';
import { WelcomeScreenComponent } from './welcome-screen/welcome-screen.component';
import { ImportExportModule } from '../shared/import-export/import-export.module';
import { SnackbarModule } from '../shared/snackbar-notification/snackbar.module';
import { FlueGasMoistureModalModule } from '../shared/flue-gas-moisture-modal/flue-gas-moisture-modal.module';
import { GenericBannerTooltipsModule } from '../shared/generic-banner-tooltips/generic-banner-tooltips.module';

@NgModule({
  declarations: [
    PhastComponent,
    PhastBannerComponent,
    PhastTabsComponent,
    SystemBasicsComponent,
    HelpPanelComponent,
    PhastDiagramComponent,
    PhastCalculatorTabsComponent,
    ModificationNavbarComponent,
    ModificationListComponent,
    AddModificationComponent,
    WelcomeScreenComponent
  ],
  exports: [
  ],
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ModalModule,
    LossesModule,
    SettingsModule,
    AuxEquipmentModule,
    DesignedEnergyModule,
    MeteredEnergyModule,
    PhastReportModule,
    PreAssessmentModule,
    O2EnrichmentModule,
    FlueGasModule,
    EfficiencyImprovementModule,
    EnergyEquivalencyModule,
    EnergyUseModule,
    ExplorePhastOpportunitiesModule,
    LossesTabsModule,
    UtilitiesModule,
    TabsTooltipModule,
    SnackbarModule,
    UnitConverterModule,
    PhastSankeyModule,
    UpdateUnitsModalModule,    
    ImportExportModule,
    FlueGasMoistureModalModule,
    GenericBannerTooltipsModule
  ],
  providers: [
    PhastService,
    PhastValidService,
    PhastResultsService,
    ConvertPhastService,
    PhastCompareService,
  ]
})

export class PhastModule { }
