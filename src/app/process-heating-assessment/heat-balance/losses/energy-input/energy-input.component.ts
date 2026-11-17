import { ChangeDetectionStrategy, Component, computed, inject, input, Signal } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { AssessmentScenario, ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { ProcessHeatingValidityService } from '../../../services/process-heating-validity.service';
import { reinitOnScenarioChange } from '../reinit-on-scenario-change';
import { EnergyInputCalculationService } from './energy-input-calculation.service';
import { EnergyInputFormService } from './energy-input-form.service';
import { EnergyInputService } from './energy-input.service';

@Component({
  selector: 'app-energy-input',
  standalone: false,
  templateUrl: './energy-input.component.html',
  styleUrl: './energy-input.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [EnergyInputService, EnergyInputFormService, EnergyInputCalculationService],
})
export class EnergyInputComponent {
  readonly scenario = input<AssessmentScenario>('baseline');

  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly validityService = inject(ProcessHeatingValidityService);
  protected readonly service = inject(EnergyInputService);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;
  readonly isEntryRequired: Signal<boolean> = computed(() => this.validityService.requiresEnergyEntry(this.scenario()));

  get resultsUnit(): string {
    const unit = this.settings()?.energyResultUnit;
    return unit === 'kWh' ? 'kW' : `${unit}/hr`;
  }

  constructor() {
    reinitOnScenarioChange(this.scenario, scenario => this.service.initialize(scenario));
  }
}
