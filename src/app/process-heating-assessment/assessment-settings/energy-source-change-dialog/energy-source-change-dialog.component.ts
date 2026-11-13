import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ViewLink } from '../../models/views';

export interface EnergySourceChangeDialogData {
  scenarioName: string;
  fromEnergySource: string;
  toEnergySource: string;
  hiddenTabs: ViewLink[];
  addedTabs: ViewLink[];
  hasInheritingModifications: boolean;
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
