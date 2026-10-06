import { ChangeDetectionStrategy, Component, inject, input, Signal } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { AssessmentScenario, ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { reinitOnScenarioChange } from '../reinit-on-scenario-change';
import { ExhaustGasCalculationService } from './exhaust-gas-calculation.service';
import { ExhaustGasFormService } from './exhaust-gas-form.service';
import { ExhaustGasService } from './exhaust-gas.service';

@Component({
  selector: 'app-exhaust-gas',
  standalone: false,
  templateUrl: './exhaust-gas.component.html',
  styleUrl: './exhaust-gas.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ExhaustGasService, ExhaustGasFormService, ExhaustGasCalculationService],
})
export class ExhaustGasComponent {
  readonly scenario = input<AssessmentScenario>('baseline');

  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  protected readonly service = inject(ExhaustGasService);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  get resultsUnit(): string {
    const unit = this.settings()?.energyResultUnit;
    return unit === 'kWh' ? 'kW' : `${unit}/hr`;
  }

  constructor() {
    reinitOnScenarioChange(this.scenario, scenario => this.service.initialize(scenario));
  }
}
