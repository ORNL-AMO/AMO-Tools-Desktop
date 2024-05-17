import { Component, ElementRef, ViewChild } from '@angular/core';
import { ProcessFlowDiagramService, ProcessFlowDiagramEventDetail, ProcessFlowDiagramState } from './process-flow-diagram.service';
import { Subscription } from 'rxjs';

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
            this.processFlowDiagramDataSub = this.processFlowDiagramService.processFlowDiagramData.subscribe(data => {
                if (data) {
                    this.updateDiagramState(data);
                }
            });
        }
    }

    ngOnDestroy() {
        this.processFlowDiagramDataSub.unsubscribe();
    }

    updateDiagramState(state: ProcessFlowDiagramState) {
        this.processFlowDiagramElement.nativeElement.diagramstate = state;
    }

    updateParentState(event) {
        let eventDetail = event.detail as ProcessFlowDiagramEventDetail
        this.processFlowDiagramService.processFlowParentData.next(undefined)
    }

}
