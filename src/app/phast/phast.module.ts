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
import { LossesTabsComponent } from './losses/losses-tabs/losses-tabs.component';
import { PhastCalculatorTabsComponent } from './phast-calculator-tabs/phast-calculator-tabs.component';
import { PreAssessmentModule } from '../calculator/furnaces/pre-assessment/pre-assessment.module';
import { O2EnrichmentModule } from '../calculator/furnaces/o2-enrichment/o2-enrichment.module';
import { EfficiencyImprovementModule } from '../calculator/furnaces/efficiency-improvement/efficiency-improvement.module';
import { EnergyEquivalencyModule } from '../calculator/furnaces/energy-equivalency/energy-equivalency.module';
import { EnergyUseModule } from '../calculator/furnaces/energy-use/energy-use.module';
import { ExplorePhastOpportunitiesComponent } from './explore-phast-opportunities/explore-phast-opportunities.component';

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
    LossesTabsComponent,
    PhastCalculatorTabsComponent,
    ExplorePhastOpportunitiesComponent
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
    EnergyUseModule
  ],
  providers: [
    PhastService,
    PhastResultsService,
    ConvertPhastService
  ]
})

export class PhastModule { }
