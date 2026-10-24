import { ProcessFlowDiagramService } from './process-flow-diagram.service';
import { Subscription } from 'rxjs';
import { ConvertValueFn, DiagramCalculatorRequest, DiagramCalculatorResult, OpenDiagramCalculatorFn, ProcessFlowDiagramState, ProcessFlowParentState } from 'process-flow-lib';
import { DiagramCalculatorHostComponent } from './diagram-calculator-host/diagram-calculator-host.component';
import { Component, ViewChild, ElementRef, Input, Output, NgZone, SimpleChanges, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-process-flow-diagram-wrapper',
    standalone: false,
    templateUrl: './process-flow-diagram-wrapper.component.html',
    styleUrls: ['./process-flow-diagram-wrapper.component.css']
})
export class ProcessFlowDiagramWrapperComponent {
    @ViewChild('pfdComponent', { static: false }) processFlowDiagramElement: ElementRef;
    @ViewChild(DiagramCalculatorHostComponent, { static: false }) calculatorHost: DiagramCalculatorHostComponent;
    processFlowDiagramDataSub: Subscription;
    @Input()
    processFlowParentState: ProcessFlowParentState;
    @Input()
    convertValueFn?: ConvertValueFn;
    // * fires once the diagram canvas has initialized and hydrated
    @Output()
    diagramReady = new EventEmitter<void>();

    // * called from React - re-enter the Angular zone so the calculator modal renders and change detection runs
    openCalculatorFn: OpenDiagramCalculatorFn = (request: DiagramCalculatorRequest): Promise<DiagramCalculatorResult> => {
        return this.ngZone.run(() => this.calculatorHost.open(request));
    };

    constructor(private processFlowDiagramService: ProcessFlowDiagramService, private ngZone: NgZone) { }

    ngOnChanges(changes: SimpleChanges) {
        this.updateDiagramParentState();
    }

    // * the first ngOnChanges runs before the element exists, so push the initial state once the view is ready
    ngAfterViewInit() {
        this.updateDiagramParentState();
    }

    updateDiagramParentState() {
        if (this.processFlowDiagramElement) {
            this.processFlowDiagramElement.nativeElement.parentstate = this.processFlowParentState;
            this.processFlowDiagramElement.nativeElement.convertValueFn = this.convertValueFn;
            this.processFlowDiagramElement.nativeElement.openCalculatorFn = this.openCalculatorFn;
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
        this.processFlowDiagramService.updateFlowDiagramData(diagramState);
    }


}
