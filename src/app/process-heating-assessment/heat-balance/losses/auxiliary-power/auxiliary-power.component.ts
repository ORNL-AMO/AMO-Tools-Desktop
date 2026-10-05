import { ChangeDetectionStrategy, Component, inject, input, Signal } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { AssessmentScenario, ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { reinitOnScenarioChange } from '../reinit-on-scenario-change';
import { AuxiliaryPowerCalculationService } from './auxiliary-power-calculation.service';
import { AuxiliaryPowerFormService } from './auxiliary-power-form.service';
import { AuxiliaryPowerService } from './auxiliary-power.service';

@Component({
  selector: 'app-auxiliary-power',
  standalone: false,
  templateUrl: './auxiliary-power.component.html',
  styleUrl: './auxiliary-power.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AuxiliaryPowerService, AuxiliaryPowerFormService, AuxiliaryPowerCalculationService],
})
export class AuxiliaryPowerComponent {
  readonly scenario = input<AssessmentScenario>('baseline');

  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  protected readonly service = inject(AuxiliaryPowerService);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  get resultsUnit(): string {
    const unit = this.settings()?.energyResultUnit;
    return unit === 'kWh' ? 'kW' : `${unit}/hr`;
  }

  constructor() {
    reinitOnScenarioChange(this.scenario, scenario => this.service.initialize(scenario));
  }
}
