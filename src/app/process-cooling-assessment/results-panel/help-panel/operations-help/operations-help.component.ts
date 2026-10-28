import { Component, inject, Signal, WritableSignal } from '@angular/core';
import { ProcessCoolingUiService } from '../../../services/process-cooling-ui.service';
import { Settings } from '../../../../shared/models/settings';
import { ProcessCoolingAssessmentService } from '../../../services/process-cooling-assessment.service';

@Component({
  selector: 'app-operations-help',
  standalone: false,
  templateUrl: './operations-help.component.html',
  styleUrl: './operations-help.component.css'
})
export class OperationsHelpComponent {
  private processCoolingService = inject(ProcessCoolingUiService);
  focusedField: WritableSignal<string> = this.processCoolingService.focusedFieldSignal;
  settings: Signal<Settings> = inject(ProcessCoolingAssessmentService).settingsSignal;
}
