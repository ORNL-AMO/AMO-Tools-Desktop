import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FlueGas, FlueGasWarnings } from '../../../../shared/models/phast/losses/flueGas';
import { AssessmentScenario, ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { FlueGasCalculationService, FlueGasVolumeResult } from './flue-gas-calculation.service';
import { DEFAULT_FLUE_GAS_NAME, FlueGasFormService, FlueGasVolumeForm } from './flue-gas-form.service';
import { getFlueGasByVolumeWarnings } from './flue-gas-warnings';

/**
 * Single-entry flue gas state. Results read only `flueGasLosses[0]`, so the form edits that entry and
 * leaves any extra imported entries untouched in the saved assessment.
 */
@Injectable()
export class FlueGasService {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly formService = inject(FlueGasFormService);
  private readonly calculationService = inject(FlueGasCalculationService);
  private readonly destroyRef = inject(DestroyRef);

  private scenario: AssessmentScenario = 'baseline';
  private name = DEFAULT_FLUE_GAS_NAME;

  readonly form = signal<FlueGasVolumeForm | null>(null);
  /** One-element list so the template can recreate the form component when the form is replaced. */
  readonly formList = computed(() => {
    const form = this.form();
    return form ? [form] : [];
  });
  readonly result = signal<FlueGasVolumeResult | null>(null);
  readonly warnings = signal<FlueGasWarnings | null>(null);
  /** True while the saved flue gas entry is By Mass, which this service does not edit yet. */
  readonly isByMass = signal(false);

  initialize(scenario: AssessmentScenario = 'baseline'): void {
    this.scenario = scenario;
    const existing = this.assessmentService.lossSignal(scenario, 'flueGasLosses')?.[0];
    this.isByMass.set(existing?.flueGasType === 'By Mass');
    this.name = existing?.name ?? DEFAULT_FLUE_GAS_NAME;
    if (this.isByMass()) {
      this.form.set(null);
      this.result.set(null);
      this.warnings.set(null);
      return;
    }
    const form = this.formService.getFlueGasVolumeForm(existing, this.assessmentService.settingsSignal());
    this.form.set(form);
    this.recalculate(form);
    form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.update(form));
  }

  private update(form: FlueGasVolumeForm): void {
    this.formService.setTemperatureValidators(form);
    this.recalculate(form);
    const extraLosses = this.assessmentService.lossSignal(this.scenario, 'flueGasLosses')?.slice(1) ?? [];
    const losses: FlueGas[] = [this.formService.buildFlueGasLoss(form, this.name), ...extraLosses];
    this.assessmentService.updateLossesProperty(this.scenario, 'flueGasLosses', losses);
  }

  private recalculate(form: FlueGasVolumeForm): void {
    const settings = this.assessmentService.settingsSignal();
    const volume = this.formService.buildFlueGasLoss(form, this.name).flueGasByVolume;
    this.warnings.set(getFlueGasByVolumeWarnings(volume, settings));
    this.result.set(form.valid ? this.calculationService.calculateByVolume(volume, settings) : null);
  }
}
