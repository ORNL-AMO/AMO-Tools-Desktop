import { ChangeDetectionStrategy, Component, inject, input, Signal } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { AssessmentScenario, ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { reinitOnScenarioChange } from '../reinit-on-scenario-change';
import { EnergyInputExhaustGasCalculationService } from './energy-input-exhaust-gas-calculation.service';
import { EnergyInputExhaustGasFormService } from './energy-input-exhaust-gas-form.service';
import { EnergyInputExhaustGasService } from './energy-input-exhaust-gas.service';

@Component({
  selector: 'app-energy-input-exhaust-gas',
  standalone: false,
  templateUrl: './energy-input-exhaust-gas.component.html',
  styleUrl: './energy-input-exhaust-gas.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [EnergyInputExhaustGasService, EnergyInputExhaustGasFormService, EnergyInputExhaustGasCalculationService],
})
export class EnergyInputExhaustGasComponent {
  readonly scenario = input<AssessmentScenario>('baseline');

  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  protected readonly service = inject(EnergyInputExhaustGasService);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  get resultsUnit(): string {
    const unit = this.settings()?.energyResultUnit;
    return unit === 'kWh' ? 'kW' : `${unit}/hr`;
  }

  constructor() {
    reinitOnScenarioChange(this.scenario, scenario => this.service.initialize(scenario));
  }
}
