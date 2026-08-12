import { ChangeDetectionStrategy, Component, inject, Inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-confirm-action',
  standalone: true,
  templateUrl: './confirm-action.component.html',
  styleUrl: './confirm-action.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmActionComponent {
  dialogRef = inject<DialogRef<string>>(DialogRef<string>);
  data: ConfirmActionData;

  constructor(@Inject(DIALOG_DATA) data: ConfirmActionData) {
    this.data = data;
  }

  close(confirmAction: boolean) {
    if (confirmAction) {
      this.dialogRef.close(this.data.resourceId);
    } else {
      this.dialogRef.close();
    }
  }
}

export interface ConfirmActionData {
  modalTitle: string;
  confirmMessage: string;
  resourceId: string;
  modalStyle?: { [key: string]: string };
  actionName?: string;
}
