import { Component, ElementRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import { ProcessFlowDiagramService } from './process-flow-diagram.service';
import { Subscription } from 'rxjs';
import { ProcessFlowDiagramState, ProcessFlowParentState } from '../../../process-flow-types/shared-process-flow-types';

@Component({
    selector: 'app-process-flow-diagram-wrapper',
    standalone: false,
    templateUrl: './process-flow-diagram-wrapper.component.html',
    styleUrl: './process-flow-diagram-wrapper.component.css'
})
export class ProcessFlowDiagramWrapperComponent {
    @ViewChild('pfdComponent', { static: false }) processFlowDiagramElement: ElementRef;
    processFlowDiagramDataSub: Subscription;
    @Input()
    processFlowParentState: ProcessFlowParentState;

    constructor(private processFlowDiagramService: ProcessFlowDiagramService) { }

    ngOnChanges(changes: SimpleChanges) {
        this.updateDiagramParentState();
    }

    updateDiagramParentState() {
        if (this.processFlowDiagramElement) {
            this.processFlowDiagramElement.nativeElement.parentstate = this.processFlowParentState;
        }
    }

    onUpdateDiagramState(event) {
        let diagramState = event.detail as ProcessFlowDiagramState;
        this.processFlowDiagramService.updateFlowDiagramData(diagramState);
    }


}
