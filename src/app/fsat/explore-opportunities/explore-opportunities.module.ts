import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExploreOpportunitiesComponent } from './explore-opportunities.component';
import { ExploreOpportunitiesService } from './explore-opportunities.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [ExploreOpportunitiesComponent],
  providers: [ExploreOpportunitiesService],
  exports: [ExploreOpportunitiesComponent]
})
export class ExploreOpportunitiesModule { }
