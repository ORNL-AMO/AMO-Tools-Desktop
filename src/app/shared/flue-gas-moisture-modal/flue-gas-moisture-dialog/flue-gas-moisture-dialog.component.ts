import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Settings } from '../../models/settings';
import { FlueGasMoistureModalService } from '../flue-gas-moisture-modal.service';

export interface FlueGasMoistureDialogData {
  settings: Settings;
}

/** CDK dialog host for the moisture calculator. Closes with the moisture percent, or undefined on cancel. */
@Component({
  selector: 'app-flue-gas-moisture-dialog',
  standalone: false,
  template: `<app-flue-gas-moisture-modal [settings]="settings" (hideModal)="dialogRef.close($event)"></app-flue-gas-moisture-modal>`,
  // Per-open instance: the root-provided service otherwise carries inputs between sessions
  providers: [FlueGasMoistureModalService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlueGasMoistureDialogComponent {
  protected readonly dialogRef = inject<DialogRef<number>>(DialogRef<number>);
  // Copy because the calculator mutates the unit fields of the settings it receives
  protected readonly settings: Settings = { ...inject<FlueGasMoistureDialogData>(DIALOG_DATA).settings };
}
