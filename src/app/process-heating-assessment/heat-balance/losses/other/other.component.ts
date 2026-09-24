import { ChangeDetectionStrategy, Component, inject, input, Signal } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { AssessmentScenario, ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { reinitOnScenarioChange } from '../reinit-on-scenario-change';
import { OtherService } from './other.service';
import { OtherFormService } from './other-form.service';

@Component({
  selector: 'app-other',
  standalone: false,
  templateUrl: './other.component.html',
  styleUrl: './other.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [OtherService, OtherFormService],
})
export class OtherComponent {
  readonly scenario = input<AssessmentScenario>('baseline');

  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  protected readonly service = inject(OtherService);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  get resultsUnit(): string {
    const unit = this.settings()?.energyResultUnit;
    return unit === 'kWh' ? 'kW' : `${unit}/hr`;
  }

  constructor() {
    reinitOnScenarioChange(this.scenario, scenario => this.service.initialize(scenario));
  }
}
