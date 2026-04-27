import { ChangeDetectionStrategy, WritableSignal, inject, Component, OnInit, DestroyRef, Signal } from '@angular/core';
import { PumpSummaryResultsService, PumpSummaryUI } from '../../services/pump-summary-results.service';
import { Observable } from 'rxjs';
import { ModificationService } from '../../services/modification.service';
import { ProcessCoolingAssessmentService } from '../../services/process-cooling-assessment.service';
import { ChillerInventoryItem, ProcessCoolingAssessment } from '../../../shared/models/process-cooling-assessment';
import { InputSummaryService } from '../../services/input-summary.service';
@Component({
    selector: 'app-input-summary',
    standalone: false, 
    templateUrl: './input-summary.component.html',
    styleUrls: ['./input-summary.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
}) export class InputSummaryComponent {
    private pumpSummaryResultsService = inject(PumpSummaryResultsService);
    private modificationService = inject(ModificationService);
    private processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
    private inputSummaryService = inject(InputSummaryService);

    inputSummaryUI$ = this.inputSummaryService.inputSummaryUI$;
    inputSummaryTableString: string;
    copyTableString: any;
    processCooling: Signal<ProcessCoolingAssessment> = this.processCoolingAssessmentService.processCoolingSignal;
    invalidModificationIds: WritableSignal<Array<string>> = this.modificationService.invalidModificationIds;


    constructor() {
        this.inputSummaryUI$.subscribe(data => {
        console.log('InputSummaryUI data:', data);
        });
    }
}
