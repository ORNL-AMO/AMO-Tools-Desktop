import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExploreOpportunitiesComponent } from './explore-opportunities.component';
import { ExploreOpportunitiesHelpComponent } from './explore-opportunities-help/explore-opportunities-help.component';
import { ExploreOpportunitiesFormComponent } from './explore-opportunities-form/explore-opportunities-form.component';
import { SystemDataFormComponent } from './explore-opportunities-form/system-data-form/system-data-form.component';
import { RatedMotorFormComponent } from './explore-opportunities-form/rated-motor-form/rated-motor-form.component';
import { FanDataFormComponent } from './explore-opportunities-form/fan-data-form/fan-data-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FsatResultsModule } from '../fsat-results/fsat-results.module';
import { HelpPanelModule } from '../help-panel/help-panel.module';
import { FsatSankeyModule } from '../../shared/fsat-sankey/fsat-sankey.module';
import { VariableFrequencyDriveFormComponent } from './explore-opportunities-form/variable-frequency-drive-form/variable-frequency-drive-form.component';
import { CalculatePressuresModule } from '../calculate-pressures/calculate-pressures.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { OperatingHoursModalModule } from '../../shared/operating-hours-modal/operating-hours-modal.module';
import { ToastModule } from '../../shared/toast/toast.module';
import { SharedPipesModule } from '../../shared/shared-pipes/shared-pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FsatResultsModule,
    HelpPanelModule,
    FsatSankeyModule,
    CalculatePressuresModule,
    ModalModule,
    OperatingHoursModalModule,
    ToastModule,
    SharedPipesModule
  ],
  declarations: [
    ExploreOpportunitiesComponent,
    ExploreOpportunitiesHelpComponent,
    ExploreOpportunitiesFormComponent,
    SystemDataFormComponent,
    RatedMotorFormComponent,
    FanDataFormComponent,
    VariableFrequencyDriveFormComponent
    ],
  providers: [],
  exports: [ExploreOpportunitiesComponent]
})
export class ExploreOpportunitiesModule { }
