import { ChangeDetectionStrategy, Component, computed, inject, input, Signal } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { AssessmentScenario, ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { reinitOnScenarioChange } from '../reinit-on-scenario-change';
import { FlueGasCalculationService } from './flue-gas-calculation.service';
import { FlueGasForm, FlueGasFormService, FlueGasMassForm, FlueGasType, FlueGasVolumeForm } from './flue-gas-form.service';
import { FlueGasService } from './flue-gas.service';
import { getAvailableHeatWarning } from './flue-gas-warnings';
import { ProcessHeatingResultsService } from '../../../services/process-heating-results.service';
import { calculateSystemEfficiencyResults } from '../heat-system-efficiency/heat-system-efficiency.component';

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
  private readonly resultsService = inject(ProcessHeatingResultsService);
  protected readonly service = inject(FlueGasService);

  readonly FlueGasType = FlueGasType;

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  readonly availableHeatWarning = computed(() => getAvailableHeatWarning(this.service.result()?.availableHeat));

  /** Gross heat and flue gas losses from the scenario's total heat input, exothermic heat and calculated available heat. */
  readonly systemResults = computed(() => {
    const availableHeat = this.service.result()?.availableHeat;
    const phast = this.assessmentService.scenarioPhastSignal(this.scenario());
    const settings = this.settings();
    const phastResults = availableHeat && phast && settings ? this.resultsService.getResults(phast, settings) : undefined;
    return phastResults ? calculateSystemEfficiencyResults(phastResults.totalInput, phastResults.exothermicHeat, availableHeat) : null;
  });

  get resultsUnit(): string {
    const unit = this.settings()?.energyResultUnit;
    return unit === 'kWh' ? 'kW' : `${unit}/hr`;
  }

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
