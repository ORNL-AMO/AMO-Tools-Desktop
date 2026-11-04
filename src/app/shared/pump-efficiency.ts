import { PSAT, PsatInputs } from './models/psat';

/** Saved efficiencies use percent; a usable supplied value must be finite and positive. */
export function usablePumpEfficiency(value: number): boolean {
  return Number.isFinite(value) && value > 0 && value <= 100;
}

/** Preserve historical inputs without invoking either the old or new estimation algorithm. */
export function migratePumpEfficiencies(psat: PSAT): boolean {
  if (!psat) { return false; }
  let changed = false;
  const input = psat.inputs;
  if (input && !input.pumpEfficiencyModel) {
    const originalPumpStyle = input.pump_style;
    if (Number.isInteger(originalPumpStyle) && originalPumpStyle >= 0 && originalPumpStyle <= 10) {
      const preserved = usablePumpEfficiency(input.pump_specified);
      input.pumpEfficiencyModel = { version: 1, source: preserved ? 'legacy-preserved' : 'needs-review', originalPumpStyle };
      if (preserved) { input.pump_style = 11; }
    } else {
      input.pumpEfficiencyModel = { version: 1, source: 'specified' };
    }
    changed = true;
  }
  for (const modification of psat.modifications ?? []) {
    changed = migratePumpEfficiencies(modification.psat) || changed;
  }
  return changed;
}

/** Inventory records describe physical equipment, independent of its efficiency input method. */
export function physicalPumpStyle(input: PsatInputs): number {
  if (!input) { return undefined; }
  return input.pump_style === 11 && input.pumpEfficiencyModel?.originalPumpStyle !== undefined
    ? input.pumpEfficiencyModel.originalPumpStyle : input.pump_style;
}

/** Updating/restoring an inventory connection must retain a preserved supplied efficiency. */
export function setPhysicalPumpStyle(input: PsatInputs, style: number): void {
  if (input.pump_style === 11 && input.pumpEfficiencyModel?.originalPumpStyle !== undefined) {
    input.pumpEfficiencyModel.originalPumpStyle = style;
  } else {
    input.pump_style = style;
  }
}
