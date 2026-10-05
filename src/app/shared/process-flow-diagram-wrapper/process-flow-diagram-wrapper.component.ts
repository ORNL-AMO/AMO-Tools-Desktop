import { Component, ElementRef, Input, NgZone, SimpleChanges, ViewChild } from '@angular/core';
import { ProcessFlowDiagramService } from './process-flow-diagram.service';
import { Subscription } from 'rxjs';
import { ConvertValueFn, DiagramCalculatorRequest, DiagramCalculatorResult, OpenDiagramCalculatorFn, ProcessFlowDiagramState, ProcessFlowParentState } from 'process-flow-lib';
import { DiagramCalculatorHostComponent } from './diagram-calculator-host/diagram-calculator-host.component';

@Component({
    selector: 'app-process-flow-diagram-wrapper',
    standalone: false,
    templateUrl: './process-flow-diagram-wrapper.component.html',
    styleUrl: './process-flow-diagram-wrapper.component.css'
})
export class ProcessFlowDiagramWrapperComponent {
    @ViewChild('pfdComponent', { static: false }) processFlowDiagramElement: ElementRef;
    @ViewChild(DiagramCalculatorHostComponent, { static: false }) calculatorHost: DiagramCalculatorHostComponent;
    processFlowDiagramDataSub: Subscription;
    @Input()
    processFlowParentState: ProcessFlowParentState;
    @Input()
    convertValueFn?: ConvertValueFn;

    // * called from React - re-enter the Angular zone so the calculator modal renders and change detection runs
    openCalculatorFn: OpenDiagramCalculatorFn = (request: DiagramCalculatorRequest): Promise<DiagramCalculatorResult> => {
        return this.ngZone.run(() => this.calculatorHost.open(request));
    };

    constructor(private processFlowDiagramService: ProcessFlowDiagramService, private ngZone: NgZone) { }

    ngOnChanges(changes: SimpleChanges) {
        this.updateDiagramParentState();
    }

    updateDiagramParentState() {
        if (this.processFlowDiagramElement) {
            this.processFlowDiagramElement.nativeElement.parentstate = this.processFlowParentState;
            this.processFlowDiagramElement.nativeElement.convertValueFn = this.convertValueFn;
            this.processFlowDiagramElement.nativeElement.openCalculatorFn = this.openCalculatorFn;
        }
    }

    onUpdateDiagramState(event) {
        let diagramState = event.detail as ProcessFlowDiagramState;
        this.processFlowDiagramService.updateFlowDiagramData(diagramState);
    }


}
