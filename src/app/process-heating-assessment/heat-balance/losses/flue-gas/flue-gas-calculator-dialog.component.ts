import { DialogRef } from '@angular/cdk/dialog';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { FlueGasWarnings } from '../../../../shared/models/phast/losses/flueGas';
import { FlueGasAvailableHeatResult, FlueGasCalculationService } from './flue-gas-calculation.service';
import { FlueGasForm, FlueGasFormService, FlueGasMassForm, FlueGasType, FlueGasVolumeForm, isFlueGasMassForm } from './flue-gas-form.service';
import { getAvailableHeatWarning, getFlueGasByMassWarnings, getFlueGasByVolumeWarnings } from './flue-gas-warnings';

export interface FlueGasCalculatorDialogData {
  settings: Settings;
}

/**
 * Standalone flue gas available heat calculator. Reuses the Flue Gas loss forms but keeps its state local,
 * so nothing is written to the assessment. Closes with the available heat (%), or undefined on cancel.
 */
@Component({
  selector: 'app-flue-gas-calculator-dialog',
  standalone: false,
  templateUrl: './flue-gas-calculator-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FlueGasFormService, FlueGasCalculationService],
})
export class FlueGasCalculatorDialogComponent {
  private readonly dialogRef = inject<DialogRef<number>>(DialogRef<number>);
  private readonly formService = inject(FlueGasFormService);
  private readonly calculationService = inject(FlueGasCalculationService);
  private readonly destroyRef = inject(DestroyRef);

  // Copy because the nested moisture calculator mutates the unit fields of the settings it receives
  readonly settings: Settings = { ...inject<FlueGasCalculatorDialogData>(DIALOG_DATA).settings };
  readonly FlueGasType = FlueGasType;

  readonly flueGasType = signal<FlueGasType>(FlueGasType.ByVolume);
  readonly form = signal<FlueGasForm>(this.formService.getFlueGasVolumeForm({}, this.settings));
  readonly result = signal<FlueGasAvailableHeatResult | null>(null);
  readonly warnings = signal<FlueGasWarnings | null>(null);
  readonly availableHeatWarning = computed(() => getAvailableHeatWarning(this.result()?.availableHeat));

  constructor() {
    this.initializeForm(this.form());
  }

  /** Switching types intentionally discards the other type's values. */
  switchType(type: FlueGasType): void {
    if (type === this.flueGasType()) return;
    this.flueGasType.set(type);
    this.initializeForm(type === FlueGasType.ByMass
      ? this.formService.getFlueGasMassForm({}, this.settings)
      : this.formService.getFlueGasVolumeForm({}, this.settings));
  }

  asMassForm(form: FlueGasForm): FlueGasMassForm {
    return form as FlueGasMassForm;
  }

  asVolumeForm(form: FlueGasForm): FlueGasVolumeForm {
    return form as FlueGasVolumeForm;
  }

  apply(): void {
    this.dialogRef.close(this.result()?.availableHeat);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  private initializeForm(form: FlueGasForm): void {
    this.form.set(form);
    this.recalculate(form);
    (form.valueChanges as Observable<unknown>).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.formService.setTemperatureValidators(form);
      this.recalculate(form);
    });
  }

  private recalculate(form: FlueGasForm): void {
    if (isFlueGasMassForm(form)) {
      const derived = this.calculationService.deriveOxygenAndExcessAir(this.formService.buildFlueGasMassLoss(form).flueGasByMass);
      form.patchValue(derived, { emitEvent: false });
      const mass = this.formService.buildFlueGasMassLoss(form).flueGasByMass;
      this.warnings.set(getFlueGasByMassWarnings(mass, this.settings));
      this.result.set(form.valid ? this.calculationService.calculateByMass(mass, this.settings) : null);
      return;
    }
    const volume = this.formService.buildFlueGasLoss(form).flueGasByVolume;
    this.warnings.set(getFlueGasByVolumeWarnings(volume, this.settings));
    this.result.set(form.valid ? this.calculationService.calculateByVolume(volume, this.settings) : null);
  }
}
