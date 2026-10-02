import { ChangeDetectionStrategy, Component, computed, inject, input, Signal } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { AssessmentScenario, ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { reinitOnScenarioChange } from '../reinit-on-scenario-change';
import { FlueGasCalculationService } from './flue-gas-calculation.service';
import { FlueGasForm, FlueGasFormService, FlueGasMassForm, FlueGasType, FlueGasVolumeForm } from './flue-gas-form.service';
import { FlueGasService } from './flue-gas.service';
import { getAvailableHeatWarning } from './flue-gas-warnings';

@Component({
  selector: 'app-flue-gas',
  standalone: false,
  templateUrl: './flue-gas.component.html',
  styleUrl: './flue-gas.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FlueGasService, FlueGasFormService, FlueGasCalculationService],
})
export class FlueGasComponent {
  readonly scenario = input<AssessmentScenario>('baseline');

  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  protected readonly service = inject(FlueGasService);

  readonly FlueGasType = FlueGasType;

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  readonly availableHeatWarning = computed(() => getAvailableHeatWarning(this.service.result()?.availableHeat));

  asMassForm(form: FlueGasForm): FlueGasMassForm {
    return form as FlueGasMassForm;
  }

  asVolumeForm(form: FlueGasForm): FlueGasVolumeForm {
    return form as FlueGasVolumeForm;
  }

  constructor() {
    reinitOnScenarioChange(this.scenario, scenario => this.service.initialize(scenario));
  }
}
