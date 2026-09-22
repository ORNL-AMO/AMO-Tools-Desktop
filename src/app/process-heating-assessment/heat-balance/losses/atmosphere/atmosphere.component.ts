import { ChangeDetectionStrategy, Component, inject, input, Signal } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { AssessmentScenario, ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { reinitOnScenarioChange } from '../reinit-on-scenario-change';
import { AtmosphereService } from './atmosphere.service';
import { AtmosphereFormService } from './atmosphere-form.service';
import { AtmosphereCalculationService } from './atmosphere-calculation.service';

@Component({
  selector: 'app-atmosphere',
  standalone: false,
  templateUrl: './atmosphere.component.html',
  styleUrl: './atmosphere.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AtmosphereService, AtmosphereFormService, AtmosphereCalculationService],
})
export class AtmosphereComponent {
  readonly scenario = input<AssessmentScenario>('baseline');

  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  protected readonly service = inject(AtmosphereService);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  get resultsUnit(): string {
    const unit = this.settings()?.energyResultUnit;
    return unit === 'kWh' ? 'kW' : `${unit}/hr`;
  }

  constructor() {
    reinitOnScenarioChange(this.scenario, scenario => this.service.initialize(scenario));
  }
}
