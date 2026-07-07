import { ChangeDetectionStrategy, WritableSignal, inject, Component, Signal } from '@angular/core';
import { ModificationService } from '../../services/modification.service';
import { ProcessCoolingAssessmentService } from '../../services/process-cooling-assessment.service';
import { ProcessCoolingAssessment } from '../../../shared/models/process-cooling-assessment';
import { InputSummaryService } from '../../services/input-summary.service';
@Component({
    selector: 'app-input-summary',
    standalone: false, 
    templateUrl: './input-summary.component.html',
    styleUrls: ['./input-summary.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
}) export class InputSummaryComponent {
    private modificationService = inject(ModificationService);
    private processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
    private inputSummaryService = inject(InputSummaryService);

    inputSummaryUI$ = this.inputSummaryService.inputSummaryUI$;
    processCooling: Signal<ProcessCoolingAssessment> = this.processCoolingAssessmentService.processCoolingSignal;
    invalidModificationIds: WritableSignal<Array<string>> = this.modificationService.invalidModificationIds;

}
