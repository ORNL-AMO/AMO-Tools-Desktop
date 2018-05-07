import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExploreOpportunitiesComponent } from './explore-opportunities.component';
import { ExploreOpportunitiesService } from './explore-opportunities.service';
import { ExploreOpportunitiesHelpComponent } from './explore-opportunities-help/explore-opportunities-help.component';
import { ExploreOpportunitiesFormComponent } from './explore-opportunities-form/explore-opportunities-form.component';
import { SystemDataFormComponent } from './explore-opportunities-form/system-data-form/system-data-form.component';
import { RatedMotorFormComponent } from './explore-opportunities-form/rated-motor-form/rated-motor-form.component';
import { FanDataFormComponent } from './explore-opportunities-form/fan-data-form/fan-data-form.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [ExploreOpportunitiesComponent, ExploreOpportunitiesHelpComponent, ExploreOpportunitiesFormComponent, SystemDataFormComponent, RatedMotorFormComponent, FanDataFormComponent],
  providers: [ExploreOpportunitiesService],
  exports: [ExploreOpportunitiesComponent]
})
export class ExploreOpportunitiesModule { }
