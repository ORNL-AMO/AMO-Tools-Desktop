import { Component, ElementRef, ViewChild } from '@angular/core';
import { ProcessFlowDiagramService } from './process-flow-diagram.service';
import { Subscription } from 'rxjs';
import { ProcessFlowDiagramEventDetail, ProcessFlowParentState } from '../../../process-flow-types/process-flow-types';

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

    ngOnInit() {}

    ngAfterViewInit() {
        if (this.processFlowDiagramElement) {
            this.processFlowDiagramDataSub = this.processFlowDiagramService.processFlowParentState.subscribe(data => {
                if (data) {
                    this.updateParentState(data);
                }
            });
        }
    }

    ngOnDestroy() {
        this.processFlowDiagramDataSub.unsubscribe();
    }

    updateParentState(state: ProcessFlowParentState) {
        this.processFlowDiagramElement.nativeElement.parentstate = state;
    }

    updateDiagramState(event) {
        let eventDetail = event.detail as ProcessFlowDiagramEventDetail
        this.processFlowDiagramService.processFlowDiagramState.next(undefined)
    }

}
