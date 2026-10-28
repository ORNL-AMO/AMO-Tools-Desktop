import { Component, inject, Signal, WritableSignal } from '@angular/core';
import { ProcessCoolingUiService } from '../../../services/process-cooling-ui.service';
import { Settings } from '../../../../shared/models/settings';
import { ProcessCoolingAssessmentService } from '../../../services/process-cooling-assessment.service';

@Component({
  selector: 'app-inventory-help',
  standalone: false,
  templateUrl: './inventory-help.component.html',
  styleUrl: './inventory-help.component.css'
})
export class InventoryHelpComponent {
  private processCoolingService = inject(ProcessCoolingUiService);
  focusedField: WritableSignal<string> = this.processCoolingService.focusedFieldSignal;
  settings: Signal<Settings> = inject(ProcessCoolingAssessmentService).settingsSignal;
}
