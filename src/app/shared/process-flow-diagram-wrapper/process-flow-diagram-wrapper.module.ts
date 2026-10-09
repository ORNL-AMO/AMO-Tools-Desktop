import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcessFlowDiagramWrapperComponent } from './process-flow-diagram-wrapper.component';
import { DiagramCalculatorHostComponent } from './diagram-calculator-host/diagram-calculator-host.component';
import { StackLossModule } from '../../calculator/steam/stack-loss/stack-loss.module';
import { OperatingHoursModalModule } from '../operating-hours-modal/operating-hours-modal.module';
import { PercentLoadEstimationModule } from '../../calculator/motors/percent-load-estimation/percent-load-estimation.module';

@NgModule({
  declarations: [ProcessFlowDiagramWrapperComponent, DiagramCalculatorHostComponent],
  imports: [
    CommonModule,
    StackLossModule,
    OperatingHoursModalModule,
    PercentLoadEstimationModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [ProcessFlowDiagramWrapperComponent],
})
export class ProcessFlowDiagramWrapperModule { }
