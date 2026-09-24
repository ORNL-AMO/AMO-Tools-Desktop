import { ChangeDetectionStrategy, Component, inject, input, Signal } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { AssessmentScenario, ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { reinitOnScenarioChange } from '../reinit-on-scenario-change';
import { OpeningService } from './opening.service';
import { OpeningFormService } from './opening-form.service';
import { OpeningCalculationService } from './opening-calculation.service';

@Component({
  selector: 'app-opening',
  standalone: false,
  templateUrl: './opening.component.html',
  styleUrl: './opening.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [OpeningService, OpeningFormService, OpeningCalculationService],
})
export class OpeningComponent {
  readonly scenario = input<AssessmentScenario>('baseline');

  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  protected readonly service = inject(OpeningService);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  get resultsUnit(): string {
    const unit = this.settings()?.energyResultUnit;
    return unit === 'kWh' ? 'kW' : `${unit}/hr`;
  }

  constructor() {
    reinitOnScenarioChange(this.scenario, scenario => this.service.initialize(scenario));
  }
}
