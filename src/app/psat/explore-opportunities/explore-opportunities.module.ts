import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExploreOpportunitiesComponent } from './explore-opportunities.component';
import { ExploreOpportunitiesFormComponent } from './explore-opportunities-form/explore-opportunities-form.component';
import { ExploreOpportunitiesHelpComponent } from './explore-opportunities-help/explore-opportunities-help.component';
import { ExploreOpportunitiesResultsComponent } from './explore-opportunities-results/explore-opportunities-results.component';
import { ExploreOpportunitiesSankeyComponent } from './explore-opportunities-sankey/explore-opportunities-sankey.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule
  ],
  declarations: [ExploreOpportunitiesComponent, ExploreOpportunitiesFormComponent, ExploreOpportunitiesHelpComponent, ExploreOpportunitiesResultsComponent, ExploreOpportunitiesSankeyComponent],
  exports: [ExploreOpportunitiesComponent, ExploreOpportunitiesResultsComponent]
})
export class ExploreOpportunitiesModule { }
