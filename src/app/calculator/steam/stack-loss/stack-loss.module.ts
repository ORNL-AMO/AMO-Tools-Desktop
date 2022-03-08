import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StackLossComponent } from './stack-loss.component';
import { StackLossFormComponent } from './stack-loss-form/stack-loss-form.component';
import { StackLossHelpComponent } from './stack-loss-help/stack-loss-help.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { StackLossByMassComponent } from './stack-loss-form/stack-loss-by-mass/stack-loss-by-mass.component';
import { StackLossByVolumeComponent } from './stack-loss-form/stack-loss-by-volume/stack-loss-by-volume.component';
import { StackLossService } from './stack-loss.service';
import { PercentGraphModule } from '../../../shared/percent-graph/percent-graph.module';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { BoilerEfficiencyModalComponent } from './boiler-efficiency-modal/boiler-efficiency-modal.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SuiteDbModule } from '../../../suiteDb/suiteDb.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SuiteDbModule,
    PercentGraphModule,
    SharedPipesModule,
    ModalModule
  ],
  declarations: [StackLossComponent, StackLossFormComponent, StackLossHelpComponent, StackLossByMassComponent, StackLossByVolumeComponent, BoilerEfficiencyModalComponent],
  exports: [StackLossComponent, BoilerEfficiencyModalComponent],
  providers: [StackLossService]
})
export class StackLossModule { }
