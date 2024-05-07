import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcessFlowDiagramWrapperComponent } from './process-flow-diagram-wrapper.component';



@NgModule({
  declarations: [ProcessFlowDiagramWrapperComponent],
  imports: [
    CommonModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [ProcessFlowDiagramWrapperComponent],
})
export class ProcessFlowDiagramWrapperModule { }
