import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { ModalModule } from 'ngx-bootstrap';
import { ToastyModule } from 'ng2-toasty';
import { MeteredEnergyModule } from './metered-energy/metered-energy.module';
import { LossesModule } from './losses/losses.module';
import { DesignedEnergyModule } from './designed-energy/designed-energy.module';
import { PhastComponent } from './phast.component';
import { PhastBannerComponent } from './phast-banner/phast-banner.component';

import { SystemBasicsComponent } from './system-basics/system-basics.component';
import { OperatingHoursComponent } from './operating-hours/operating-hours.component';
import { PhastTabsComponent } from './phast-tabs/phast-tabs.component';
import { HelpPanelComponent } from './help-panel/help-panel.component';

import { PhastService } from './phast.service';
import { SettingsModule } from '../settings/settings.module';
import { AuxEquipmentModule } from './aux-equipment/aux-equipment.module';
import { SankeyModule } from './sankey/sankey.module';
import { PhastReportModule } from './phast-report/phast-report.module';
import { PhastDiagramComponent } from './phast-diagram/phast-diagram.component';
import { PhastResultsService } from './phast-results.service';
import { EnergyCostsComponent } from './energy-costs/energy-costs.component';
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

@NgModule({
  declarations: [
    PhastComponent,
    PhastBannerComponent,
    PhastTabsComponent,
    SystemBasicsComponent,
    OperatingHoursComponent,
    HelpPanelComponent,
    PhastDiagramComponent,
    EnergyCostsComponent,
    PhastCalculatorTabsComponent,
    ModificationNavbarComponent,
    ModificationListComponent,
    AddModificationComponent
  ],
  exports: [
  ],
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    ModalModule,
    LossesModule,
    ToastyModule,
    SettingsModule,
    AuxEquipmentModule,
    DesignedEnergyModule,
    MeteredEnergyModule,
    SankeyModule,
    PhastReportModule,
    PreAssessmentModule,
    O2EnrichmentModule,
    EfficiencyImprovementModule,
    EnergyEquivalencyModule,
    EnergyUseModule,
    ExplorePhastOpportunitiesModule,
    LossesTabsModule
  ],
  providers: [
    PhastService,
    PhastResultsService,
    ConvertPhastService,
    PhastCompareService
  ]
})

export class PhastModule { }
