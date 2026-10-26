import { Component, inject, Signal, WritableSignal } from '@angular/core';
import { ProcessCoolingUiService } from '../../../services/process-cooling-ui.service';
import { Settings } from '../../../../shared/models/settings';
import { ProcessCoolingAssessmentService } from '../../../services/process-cooling-assessment.service';

@Component({
  selector: 'app-water-pump-help',
  standalone: false,
  templateUrl: './water-pump-help.component.html',
  styleUrl: './water-pump-help.component.css'
})
export class WaterPumpHelpComponent {
  private processCoolingService = inject(ProcessCoolingUiService);
  focusedField: WritableSignal<string> = this.processCoolingService.focusedFieldSignal;
  settings: Signal<Settings> = inject(ProcessCoolingAssessmentService).settingsSignal;

}
