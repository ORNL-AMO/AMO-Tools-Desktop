import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WasteWaterComponent } from './waste-water.component';
import { WasteWaterBannerComponent } from './waste-water-banner/waste-water-banner.component';
import { RouterModule } from '@angular/router';
import { SystemBasicsComponent } from './system-basics/system-basics.component';
import { WasteWaterService } from './waste-water.service';
import { HelpPanelComponent } from './results-panel/help-panel/help-panel.component';
import { ActivatedSludgeFormComponent } from './activated-sludge-form/activated-sludge-form.component';
import { ActivatedSludgeFormService } from './activated-sludge-form/activated-sludge-form.service';
import { AeratorPerformanceFormComponent } from './aerator-performance-form/aerator-performance-form.component';
import { AeratorPerformanceFormService } from './aerator-performance-form/aerator-performance-form.service';
import { ReactiveFormsModule } from '@angular/forms';
import { ModelingOptionsFormComponent } from './modeling-options-form/modeling-options-form.component';
import { ModelingOptionsFormService } from './modeling-options-form/modeling-options-form.service';
import { ResultsPanelComponent } from './results-panel/results-panel.component';
import { ResultsTableComponent } from './results-panel/results-table/results-table.component';
import { ModifyConditionsComponent } from './modify-conditions/modify-conditions.component';
import { ExploreOpportunitiesComponent } from './explore-opportunities/explore-opportunities.component';



@NgModule({
  declarations: [
    WasteWaterComponent, 
    WasteWaterBannerComponent, 
    SystemBasicsComponent, 
    HelpPanelComponent, 
    ActivatedSludgeFormComponent,
     AeratorPerformanceFormComponent,
     ModelingOptionsFormComponent,
     ResultsPanelComponent,
     ResultsTableComponent,
     ModifyConditionsComponent,
     ExploreOpportunitiesComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  providers: [
    WasteWaterService,
    ActivatedSludgeFormService,
    AeratorPerformanceFormService,
    ModelingOptionsFormService
  ]
})
export class WasteWaterModule { }
