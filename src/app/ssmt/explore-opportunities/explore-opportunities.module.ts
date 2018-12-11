import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExploreOpportunitiesComponent } from './explore-opportunities.component';
import { ExploreOpportunitiesFormComponent } from './explore-opportunities-form/explore-opportunities-form.component';
import { ExploreOpportunitiesHelpComponent } from './explore-opportunities-help/explore-opportunities-help.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OperationsFormComponent } from './explore-opportunities-form/operations-form/operations-form.component';
import { BoilerFormComponent } from './explore-opportunities-form/boiler-form/boiler-form.component';
import { HeaderFormComponent } from './explore-opportunities-form/header-form/header-form.component';
import { CondensateHandlingFormComponent } from './explore-opportunities-form/header-form/condensate-handling-form/condensate-handling-form.component';
import { TurbineFormComponent } from './explore-opportunities-form/turbine-form/turbine-form.component';
import { ExploreCondensingTurbineFormComponent } from './explore-opportunities-form/turbine-form/explore-condensing-turbine-form/explore-condensing-turbine-form.component';
import { ExplorePressureTurbineFormComponent } from './explore-opportunities-form/turbine-form/explore-pressure-turbine-form/explore-pressure-turbine-form.component';
import { ExploreTurbineFormComponent } from './explore-opportunities-form/turbine-form/explore-turbine-form/explore-turbine-form.component';
import { HelpPanelModule } from '../help-panel/help-panel.module';
import { ExploreOpportunitiesService } from './explore-opportunities.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HelpPanelModule
  ],
  declarations: [ExploreOpportunitiesComponent, ExploreOpportunitiesFormComponent, ExploreOpportunitiesHelpComponent, OperationsFormComponent, BoilerFormComponent, HeaderFormComponent, CondensateHandlingFormComponent, TurbineFormComponent, ExploreCondensingTurbineFormComponent, ExplorePressureTurbineFormComponent, ExploreTurbineFormComponent],
  exports: [ExploreOpportunitiesComponent],
  providers: [ExploreOpportunitiesService]
})
export class ExploreOpportunitiesModule { }
