import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExploreOpportunitiesComponent } from './explore-opportunities.component';
import { ExploreOpportunitiesFormComponent } from './explore-opportunities-form/explore-opportunities-form.component';
import { ExploreOpportunitiesHelpComponent } from './explore-opportunities-help/explore-opportunities-help.component';
import { ExploreOpportunitiesResultsComponent } from './explore-opportunities-results/explore-opportunities-results.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SystemDataFormComponent } from './explore-opportunities-form/system-data-form/system-data-form.component';
import { RatedMotorFormComponent } from './explore-opportunities-form/rated-motor-form/rated-motor-form.component';
import { PumpDataFormComponent } from './explore-opportunities-form/pump-data-form/pump-data-form.component';
import { VariableFrequencyDriveFormComponent } from './explore-opportunities-form/variable-frequency-drive-form/variable-frequency-drive-form.component';
import { HeadToolModule } from '../../calculator/pumps/head-tool/head-tool.module';
import { ModalModule } from 'ngx-bootstrap';
import { OperatingHoursModalModule } from '../../shared/operating-hours-modal/operating-hours-modal.module';
import { PercentGraphModule } from '../../shared/percent-graph/percent-graph.module';
import { ToastModule } from '../../shared/toast/toast.module';
import { SharedPipesModule } from '../../shared/shared-pipes/shared-pipes.module';
import { PsatSankeyModule } from '../../shared/psat-sankey/psat-sankey.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HeadToolModule,
    ModalModule,
    OperatingHoursModalModule,
    PercentGraphModule,
    ToastModule,
    SharedPipesModule,
    PsatSankeyModule
  ],
  declarations: [
    ExploreOpportunitiesComponent, 
    ExploreOpportunitiesFormComponent, 
    ExploreOpportunitiesHelpComponent, 
    ExploreOpportunitiesResultsComponent, 
    SystemDataFormComponent,
    RatedMotorFormComponent,
    PumpDataFormComponent,
    VariableFrequencyDriveFormComponent,
  ],
  exports: [ExploreOpportunitiesComponent, ExploreOpportunitiesResultsComponent]
})
export class ExploreOpportunitiesModule { }
