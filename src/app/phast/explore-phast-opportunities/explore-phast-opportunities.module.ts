import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExplorePhastOpportunitiesFormComponent } from './explore-phast-opportunities-form/explore-phast-opportunities-form.component';
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
import { ExploreSlagFormComponent } from './explore-phast-opportunities-form/explore-slag-form/explore-slag-form.component';
import { ExploreCoolingFormComponent } from './explore-phast-opportunities-form/explore-cooling-form/explore-cooling-form.component';
import { ExploreAtmosphereFormComponent } from './explore-phast-opportunities-form/explore-atmosphere-form/explore-atmosphere-form.component';

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
    ExplorePhastOpportunitiesComponent,
    ExploreChargeMaterialsFormComponent,
    ExploreFixturesFormComponent,
    ExploreLeakageFormComponent,
    ExploreWallFormComponent,
    ExploreOpeningFormComponent,
    ExploreOperationsFormComponent,
    ExploreFlueGasFormComponent,
    ExploreSystemEfficiencyFormComponent,
    ExploreSlagFormComponent,
    ExploreCoolingFormComponent,
    ExploreAtmosphereFormComponent
  ],
  exports: [
    ExplorePhastOpportunitiesComponent
  ]
})
export class ExplorePhastOpportunitiesModule { }
