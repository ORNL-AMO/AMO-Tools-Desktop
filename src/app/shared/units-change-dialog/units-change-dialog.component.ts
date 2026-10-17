import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

export type UnitsChangeAction = 'convert' | 'relabel';

export interface UnitsChangeDialogData {
  fromUnits: string;
  toUnits: string;
}

/**
 * Confirms a unit system change and asks whether entered data is converted or only relabeled.
 * Closes with no result when cancelled.
 */
@Component({
  selector: 'app-units-change-dialog',
  standalone: true,
  templateUrl: './units-change-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitsChangeDialogComponent {
  private readonly dialogRef = inject<DialogRef<UnitsChangeAction>>(DialogRef);
  readonly data = inject<UnitsChangeDialogData>(DIALOG_DATA);

  close(action?: UnitsChangeAction): void {
    this.dialogRef.close(action);
  }
}
