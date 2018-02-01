import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExploreOpportunitiesComponent } from './explore-opportunities.component';
import { ExploreOpportunitiesFormComponent } from './explore-opportunities-form/explore-opportunities-form.component';
import { ExploreOpportunitiesHelpComponent } from './explore-opportunities-help/explore-opportunities-help.component';
import { ExploreOpportunitiesResultsComponent } from './explore-opportunities-results/explore-opportunities-results.component';
import { ExploreOpportunitiesSankeyComponent } from './explore-opportunities-sankey/explore-opportunities-sankey.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { SystemDataFormComponent } from './explore-opportunities-form/system-data-form/system-data-form.component';
import { RatedMotorFormComponent } from './explore-opportunities-form/rated-motor-form/rated-motor-form.component';
import { PumpDataFormComponent } from './explore-opportunities-form/pump-data-form/pump-data-form.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule
  ],
  declarations: [
    ExploreOpportunitiesComponent, 
    ExploreOpportunitiesFormComponent, 
    ExploreOpportunitiesHelpComponent, 
    ExploreOpportunitiesResultsComponent, 
    ExploreOpportunitiesSankeyComponent,
    SystemDataFormComponent,
    RatedMotorFormComponent,
    PumpDataFormComponent
  ],
  exports: [ExploreOpportunitiesComponent, ExploreOpportunitiesResultsComponent]
})
export class ExploreOpportunitiesModule { }
