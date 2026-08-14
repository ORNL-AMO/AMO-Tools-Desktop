import { FormControl, ValidatorFn, Validators } from '@angular/forms';

/**
 * Re-derives the `initialTemperature` max validator from the current discharge temperature value.
 * Shared by the gas/liquid/solid charge-material forms.
 */
export function applyInitialTempMaxValidator(
  initialTemperature: FormControl<number | null>,
  dischargeTemperature: number | null,
): void {
  const validators: ValidatorFn[] = dischargeTemperature != null
    ? [Validators.required, Validators.max(dischargeTemperature)]
    : [Validators.required];
  initialTemperature.setValidators(validators);
  if (dischargeTemperature != null) {
    initialTemperature.markAsDirty();
  }
  initialTemperature.updateValueAndValidity({ emitEvent: false });
}
