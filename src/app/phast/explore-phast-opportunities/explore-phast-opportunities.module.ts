import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExplorePhastOpportunitiesFormComponent } from './explore-phast-opportunities-form/explore-phast-opportunities-form.component';
import { ExplorePhastOpportunitiesHelpComponent } from './explore-phast-opportunities-help/explore-phast-opportunities-help.component';
import { ExplorePhastOpportunitiesResultsComponent } from './explore-phast-opportunities-results/explore-phast-opportunities-results.component';
import { ExplorePhastOpportunitiesComponent } from './explore-phast-opportunities.component';
import { ExploreChargeMaterialsFormComponent } from './explore-phast-opportunities-form/explore-charge-materials-form/explore-charge-materials-form.component';
import { ExploreFixturesFormComponent } from './explore-phast-opportunities-form/explore-fixtures-form/explore-fixtures-form.component';
import { ExploreLeakageFormComponent } from './explore-phast-opportunities-form/explore-leakage-form/explore-leakage-form.component';
import { ExploreWallFormComponent } from './explore-phast-opportunities-form/explore-wall-form/explore-wall-form.component';
import { ExploreOpeningFormComponent } from './explore-phast-opportunities-form/explore-opening-form/explore-opening-form.component';
import { ExploreOperationsFormComponent } from './explore-phast-opportunities-form/explore-operations-form/explore-operations-form.component';
import { ExploreFlueGasFormComponent } from './explore-phast-opportunities-form/explore-flue-gas-form/explore-flue-gas-form.component';
import { ExploreSystemEfficiencyFormComponent } from './explore-phast-opportunities-form/explore-system-efficiency-form/explore-system-efficiency-form.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LossesModule } from '../losses/losses.module';
import { ModalModule } from 'ngx-bootstrap';
import { ToastyModule } from 'ng2-toasty';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LossesModule,
    ModalModule,
    ToastyModule
  ],
  declarations: [
    ExplorePhastOpportunitiesFormComponent,
    ExplorePhastOpportunitiesHelpComponent,
    ExplorePhastOpportunitiesResultsComponent,
    ExplorePhastOpportunitiesComponent,
    ExploreChargeMaterialsFormComponent,
    ExploreFixturesFormComponent,
    ExploreLeakageFormComponent,
    ExploreWallFormComponent,
    ExploreOpeningFormComponent,
    ExploreOperationsFormComponent,
    ExploreFlueGasFormComponent,
    ExploreSystemEfficiencyFormComponent
  ],
  exports: [
    ExplorePhastOpportunitiesComponent
  ]
})
export class ExplorePhastOpportunitiesModule { }
