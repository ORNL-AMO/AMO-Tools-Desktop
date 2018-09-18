import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExploreOpportunitiesComponent } from './explore-opportunities.component';
import { ExploreOpportunitiesFormComponent } from './explore-opportunities-form/explore-opportunities-form.component';
import { ExploreOpportunitiesHelpComponent } from './explore-opportunities-help/explore-opportunities-help.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [ExploreOpportunitiesComponent, ExploreOpportunitiesFormComponent, ExploreOpportunitiesHelpComponent],
  exports: [ExploreOpportunitiesComponent]
})
export class ExploreOpportunitiesModule { }
