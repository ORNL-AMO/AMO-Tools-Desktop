import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcessFlowDiagramWrapperModule } from '../shared/process-flow-diagram-wrapper/process-flow-diagram-wrapper.module';
import { WaterProcessDiagramComponent } from './water-process-diagram.component';
import { WaterDiagramBannerComponent } from './water-diagram-banner/water-diagram-banner.component';
import { WaterDiagramSetupComponent } from './water-diagram-setup/water-diagram-setup.component';
import { WaterDiagramComponent } from './water-diagram/water-diagram.component';
import { RouterModule } from '@angular/router';
import { WaterProcessDiagramService } from './water-process-diagram.service';
import { CreateAssessmentModalModule } from '../shared/create-assessment-modal/create-assessment-modal.module';
import { WaterDiagramConnectionsService } from './water-diagram-connections.service';



@NgModule({
  declarations: [
    WaterProcessDiagramComponent,
    WaterDiagramBannerComponent,
    WaterDiagramSetupComponent,
    WaterDiagramComponent
  ],
  imports: [
    CommonModule,
    ProcessFlowDiagramWrapperModule,
    RouterModule,
    CreateAssessmentModalModule
  ],
  exports: [
    WaterProcessDiagramComponent
  ],
  providers: [
    WaterProcessDiagramService,
    WaterDiagramConnectionsService
  ]
})
export class WaterProcessDiagramModule { }
