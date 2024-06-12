import { Component, ElementRef, ViewChild } from '@angular/core';
import { ProcessFlowDiagramService } from './process-flow-diagram.service';
import { Subscription } from 'rxjs';
import { ProcessFlowDiagramState, ProcessFlowParentState } from '../../../process-flow-types/process-flow-types';

@Component({
    selector: 'app-process-flow-diagram-wrapper',
    standalone: false,
    templateUrl: './process-flow-diagram-wrapper.component.html',
    styleUrl: './process-flow-diagram-wrapper.component.css'
})
export class ProcessFlowDiagramWrapperComponent {
    @ViewChild('pfdComponent', { static: false }) processFlowDiagramElement: ElementRef;
    processFlowDiagramDataSub: Subscription;

    constructor(private processFlowDiagramService: ProcessFlowDiagramService) { }

    ngAfterViewInit() {
        if (this.processFlowDiagramElement) {
            this.processFlowDiagramDataSub = this.processFlowDiagramService.processFlowParentState.subscribe(data => {
                if (data) {
                    this.updateDiagramParentState(data);
                }
            });
        }
    }

    ngOnDestroy() {
        this.processFlowDiagramDataSub.unsubscribe();
    }

    updateDiagramParentState(state: ProcessFlowParentState) {
        this.processFlowDiagramElement.nativeElement.parentstate = state;
    }

    async onUpdateDiagramState(event) {
        let diagramState = event.detail as ProcessFlowDiagramState;
        await this.processFlowDiagramService.updateFlowDiagramData(diagramState);
    }

}
