import { ChangeDetectionStrategy, Component, inject, input, Signal } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { AssessmentScenario, ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { reinitOnScenarioChange } from '../reinit-on-scenario-change';
import { SlagCalculationService } from './slag-calculation.service';
import { SlagFormService } from './slag-form.service';
import { SlagService } from './slag.service';

@Component({
  selector: 'app-slag',
  standalone: false,
  templateUrl: './slag.component.html',
  styleUrl: './slag.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SlagService, SlagFormService, SlagCalculationService],
})
export class SlagComponent {
  readonly scenario = input<AssessmentScenario>('baseline');

  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  protected readonly service = inject(SlagService);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  get resultsUnit(): string {
    const unit = this.settings()?.energyResultUnit;
    return unit === 'kWh' ? 'kW' : `${unit}/hr`;
  }

  constructor() {
    reinitOnScenarioChange(this.scenario, scenario => this.service.initialize(scenario));
  }
}
