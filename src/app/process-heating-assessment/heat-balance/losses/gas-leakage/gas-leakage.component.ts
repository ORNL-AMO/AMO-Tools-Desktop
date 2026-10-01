import { ChangeDetectionStrategy, Component, inject, input, Signal } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { AssessmentScenario, ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { reinitOnScenarioChange } from '../reinit-on-scenario-change';
import { GasLeakageService } from './gas-leakage.service';
import { GasLeakageFormService } from './gas-leakage-form.service';
import { GasLeakageCalculationService } from './gas-leakage-calculation.service';

@Component({
  selector: 'app-gas-leakage',
  standalone: false,
  templateUrl: './gas-leakage.component.html',
  styleUrl: './gas-leakage.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [GasLeakageService, GasLeakageFormService, GasLeakageCalculationService],
})
export class GasLeakageComponent {
  readonly scenario = input<AssessmentScenario>('baseline');

  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  protected readonly service = inject(GasLeakageService);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  get resultsUnit(): string {
    const unit = this.settings()?.energyResultUnit;
    return unit === 'kWh' ? 'kW' : `${unit}/hr`;
  }

  constructor() {
    reinitOnScenarioChange(this.scenario, scenario => this.service.initialize(scenario));
  }
}
