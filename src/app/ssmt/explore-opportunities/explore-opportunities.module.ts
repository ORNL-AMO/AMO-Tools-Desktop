import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExploreOpportunitiesComponent } from './explore-opportunities.component';
import { ExploreOpportunitiesFormComponent } from './explore-opportunities-form/explore-opportunities-form.component';
import { ExploreOpportunitiesHelpComponent } from './explore-opportunities-help/explore-opportunities-help.component';
import { FormsModule } from '@angular/forms';
import { OperationsFormComponent } from './explore-opportunities-form/operations-form/operations-form.component';
import { BoilerFormComponent } from './explore-opportunities-form/boiler-form/boiler-form.component';
import { HeaderFormComponent } from './explore-opportunities-form/header-form/header-form.component';
import { CondensateHandlingFormComponent } from './explore-opportunities-form/header-form/condensate-handling-form/condensate-handling-form.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [ExploreOpportunitiesComponent, ExploreOpportunitiesFormComponent, ExploreOpportunitiesHelpComponent, OperationsFormComponent, BoilerFormComponent, HeaderFormComponent, CondensateHandlingFormComponent],
  exports: [ExploreOpportunitiesComponent]
})
export class ExploreOpportunitiesModule { }
