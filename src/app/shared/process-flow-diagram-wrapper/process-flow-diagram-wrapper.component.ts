import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ProcessFlowDiagramService } from './process-flow-diagram.service';
import { Subscription } from 'rxjs';
import { ConvertValueFn, ProcessFlowDiagramState, ProcessFlowParentState } from 'process-flow-lib';

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
    @Input()
    convertValueFn?: ConvertValueFn;
    // * fires once the diagram canvas has initialized and hydrated
    @Output()
    diagramReady = new EventEmitter<void>();

    constructor(private processFlowDiagramService: ProcessFlowDiagramService) { }

    ngOnChanges(changes: SimpleChanges) {
        this.updateDiagramParentState();
    }

    // * the first ngOnChanges runs before the element exists, so push the initial state once the view is ready
    ngAfterViewInit() {
        this.updateDiagramParentState();
    }

    updateDiagramParentState() {
        if (this.processFlowDiagramElement) {
            // console.log('SET DIAGRAM FROM MEASUR updateDiagramParentState flowDiagramData', JSON.parse(JSON.stringify(this.processFlowParentState.waterDiagram.flowDiagramData)));
            this.processFlowDiagramElement.nativeElement.parentstate = this.processFlowParentState;
            this.processFlowDiagramElement.nativeElement.convertValueFn = this.convertValueFn;
        }
    }

    /** Emits any save the web component is still debouncing, so the parent can persist it now. */
    flush() {
        this.processFlowDiagramElement?.nativeElement?.flush?.();
    }

    // * this hook runs in the parent view's cleanup, after this view's template listener is already removed, so listen directly
    // * for the flushed event. The parent's diagram subscription is still live at this point.
    ngOnDestroy() {
        const element: HTMLElement & { flush?: () => void } = this.processFlowDiagramElement?.nativeElement;
        if (!element?.flush) {
            return;
        }
        const onFlushedState = (event: Event) => this.onUpdateDiagramState(event);
        element.addEventListener('updateDiagramDetailEvent', onFlushedState);
        try {
            element.flush();
        } finally {
            element.removeEventListener('updateDiagramDetailEvent', onFlushedState);
        }
    }

    onUpdateDiagramState(event) {
        let diagramState = event.detail as ProcessFlowDiagramState;
        // console.log('SAVE DIAGRAM TO MEASUR updateDiagramParentState flowDiagramData', JSON.parse(JSON.stringify(diagramState.flowDiagramData)));

        this.processFlowDiagramService.updateFlowDiagramData(diagramState);
    }


}
