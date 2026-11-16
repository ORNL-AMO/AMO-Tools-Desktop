import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Settings } from '../../../shared/models/settings';
import { getEnergySourceLabel } from '../../models/energy-source';
import { getEnergySourceTabChanges, ViewLink } from '../../models/views';
import { deriveHeatingEquipmentConfiguration } from '../../services/process-heating-assessment.service';

export interface EnergySourceChangeDialogData {
  scenarioName: string;
  fromEnergySource: string;
  toEnergySource: string;
  hiddenTabs: ViewLink[];
  addedTabs: ViewLink[];
  hasInheritingModifications: boolean;
}

/**
 * @param scenarioName 'Baseline' or the modification's name
 * @param current the scenario's settings before the change
 * @param next the scenario's settings after the change
 * @param hasInheritingModifications whether modifications without their own energy source will follow the change
 */
export function buildEnergySourceChangeDialogData(
  scenarioName: string, current: Settings, next: Settings, hasInheritingModifications: boolean,
): EnergySourceChangeDialogData {
  const { hidden, added } = getEnergySourceTabChanges(deriveHeatingEquipmentConfiguration(current), deriveHeatingEquipmentConfiguration(next));
  return {
    scenarioName,
    fromEnergySource: getEnergySourceLabel(current),
    toEnergySource: getEnergySourceLabel(next),
    hiddenTabs: hidden,
    addedTabs: added,
    hasInheritingModifications,
  };
}

/**
 * Confirms an energy source change and lists the Heat Balance tabs it hides and adds.
 * Closes with `true` when confirmed and no result when cancelled.
 */
@Component({
  selector: 'app-energy-source-change-dialog',
  standalone: true,
  templateUrl: './energy-source-change-dialog.component.html',
  styleUrl: './energy-source-change-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnergySourceChangeDialogComponent {
  private readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  readonly data = inject<EnergySourceChangeDialogData>(DIALOG_DATA);

  close(confirmed?: boolean): void {
    this.dialogRef.close(confirmed);
  }
}
