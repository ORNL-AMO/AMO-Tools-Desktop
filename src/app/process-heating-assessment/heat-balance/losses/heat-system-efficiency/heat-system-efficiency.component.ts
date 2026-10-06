import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, Signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingResultsService } from '../../../services/process-heating-results.service';
import { AssessmentScenario, ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { reinitOnScenarioChange } from '../reinit-on-scenario-change';

/**
 * @param totalInput total heat input, in the settings' energy result unit
 * @param exothermicHeat exothermic heat from charge materials (sign ignored)
 * @param efficiency heat system efficiency, percent
 */
export function calculateSystemEfficiencyResults(totalInput: number, exothermicHeat: number, efficiency: number): { grossHeat: number; systemLosses: number } {
  const grossHeat = (totalInput / efficiency - Math.abs(exothermicHeat)) * 100;
  return { grossHeat, systemLosses: grossHeat * (1 - efficiency / 100) };
}

@Component({
  selector: 'app-heat-system-efficiency',
  standalone: false,
  templateUrl: './heat-system-efficiency.component.html',
  styleUrl: './heat-system-efficiency.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeatSystemEfficiencyComponent {
  readonly scenario = input<AssessmentScenario>('baseline');

  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly resultsService = inject(ProcessHeatingResultsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;
  readonly form = new FormGroup({
    efficiency: new FormControl<number | null>(null, [Validators.required, Validators.min(0), Validators.max(100)]),
  });

  /** Gross heat and system losses derived from the scenario's total heat input and exothermic heat. */
  readonly results = computed(() => {
    const phast = this.assessmentService.scenarioPhastSignal(this.scenario());
    const efficiency = phast?.systemEfficiency;
    const settings = this.settings();
    const phastResults = phast && settings ? this.resultsService.getResults(phast, settings) : undefined;
    if (!phastResults || !efficiency) {
      return null;
    }
    return calculateSystemEfficiencyResults(phastResults.totalInput, phastResults.exothermicHeat, efficiency);
  });

  get resultsUnit(): string {
    const unit = this.settings()?.energyResultUnit;
    return unit === 'kWh' ? 'kW' : `${unit}/hr`;
  }

  constructor() {
    reinitOnScenarioChange(this.scenario, scenario => {
      const saved = this.assessmentService.scenarioPhast(scenario)?.systemEfficiency;
      this.form.controls.efficiency.setValue(saved ?? null, { emitEvent: false });
    });
    this.form.controls.efficiency.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
      if (this.form.controls.efficiency.valid && value != null) {
        untracked(() => this.save(value));
      }
    });
  }

  private save(efficiency: number): void {
    const scenario = this.scenario();
    if (scenario === 'baseline') {
      this.assessmentService.updateProcessHeatingProperty('systemEfficiency', efficiency);
    } else {
      this.assessmentService.updateModificationProperty(scenario, 'systemEfficiency', efficiency);
    }
  }
}
