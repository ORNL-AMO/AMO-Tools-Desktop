import { Component, computed, inject, Signal, WritableSignal } from '@angular/core';
import { ProcessCoolingUiService } from '../../../services/process-cooling-ui.service';
import { Settings } from '../../../../shared/models/settings';
import { ProcessCoolingAssessmentService } from '../../../services/process-cooling-assessment.service';

@Component({
  selector: 'app-tower-help',
  standalone: false,
  templateUrl: './tower-help.component.html',
  styleUrl: './tower-help.component.css'
})
export class TowerHelpComponent {
  private processCoolingService = inject(ProcessCoolingUiService);
  focusedField: WritableSignal<string> = this.processCoolingService.focusedFieldSignal;
  private readonly settings: Signal<Settings> = inject(ProcessCoolingAssessmentService).settingsSignal;
  readonly isMetric: Signal<boolean> = computed(() => this.settings()?.unitsOfMeasure === 'Metric');
}