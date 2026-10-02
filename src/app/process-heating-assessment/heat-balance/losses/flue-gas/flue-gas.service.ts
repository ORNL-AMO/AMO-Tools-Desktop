import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { FlueGas, FlueGasWarnings } from '../../../../shared/models/phast/losses/flueGas';
import { AssessmentScenario, ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { FlueGasAvailableHeatResult, FlueGasCalculationService } from './flue-gas-calculation.service';
import { DEFAULT_FLUE_GAS_NAME, FlueGasForm, FlueGasFormService, FlueGasMassForm, FlueGasType, isFlueGasMassForm } from './flue-gas-form.service';
import { getFlueGasByMassWarnings, getFlueGasByVolumeWarnings } from './flue-gas-warnings';

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

  readonly form = signal<FlueGasForm | null>(null);
  /** One-element list so the template can recreate the form component when the form is replaced. */
  readonly formList = computed(() => {
    const form = this.form();
    return form ? [form] : [];
  });
  readonly flueGasType = signal<FlueGasType>(FlueGasType.ByVolume);
  readonly result = signal<FlueGasAvailableHeatResult | null>(null);
  readonly warnings = signal<FlueGasWarnings | null>(null);

  initialize(scenario: AssessmentScenario = 'baseline'): void {
    this.scenario = scenario;
    const existing = this.assessmentService.lossSignal(scenario, 'flueGasLosses')?.[0];
    this.name = existing?.name ?? DEFAULT_FLUE_GAS_NAME;
    this.setForm(existing?.flueGasType === FlueGasType.ByMass ? FlueGasType.ByMass : FlueGasType.ByVolume, existing);
  }

  /** Switching types intentionally discards the other type's values. */
  switchType(type: FlueGasType): void {
    if (type === this.flueGasType()) return;
    this.setForm(type, undefined);
    this.save(this.form());
  }

  private setForm(type: FlueGasType, loss: FlueGas | undefined): void {
    const settings = this.assessmentService.settingsSignal();
    const form: FlueGasForm = type === FlueGasType.ByMass
      ? this.formService.getFlueGasMassForm(loss, settings)
      : this.formService.getFlueGasVolumeForm(loss, settings);
    this.flueGasType.set(type);
    this.form.set(form);
    this.recalculate(form);
    (form.valueChanges as Observable<unknown>).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.update(form));
  }

  private update(form: FlueGasForm): void {
    this.formService.setTemperatureValidators(form);
    this.recalculate(form);
    this.save(form);
  }

  private save(form: FlueGasForm): void {
    const extraLosses = this.assessmentService.lossSignal(this.scenario, 'flueGasLosses')?.slice(1) ?? [];
    const losses: FlueGas[] = [this.formService.buildLoss(form, this.name), ...extraLosses];
    this.assessmentService.updateLossesProperty(this.scenario, 'flueGasLosses', losses);
  }

  private recalculate(form: FlueGasForm): void {
    const settings = this.assessmentService.settingsSignal();
    if (isFlueGasMassForm(form)) {
      this.recalculateByMass(form, settings);
      return;
    }
    const volume = this.formService.buildFlueGasLoss(form, this.name).flueGasByVolume;
    this.warnings.set(getFlueGasByVolumeWarnings(volume, settings));
    this.result.set(form.valid ? this.calculationService.calculateByVolume(volume, settings) : null);
  }

  /** Keeps the derived O2 / excess air field in step with the entered one, as the saved shape stores both. */
  private recalculateByMass(form: FlueGasMassForm, settings: Settings): void {
    const mass = this.formService.buildFlueGasMassLoss(form, this.name).flueGasByMass;
    form.patchValue(this.calculationService.deriveOxygenAndExcessAir(mass), { emitEvent: false });
    const synced = this.formService.buildFlueGasMassLoss(form, this.name).flueGasByMass;
    this.warnings.set(getFlueGasByMassWarnings(synced, settings));
    this.result.set(form.valid ? this.calculationService.calculateByMass(synced, settings) : null);
  }
}
