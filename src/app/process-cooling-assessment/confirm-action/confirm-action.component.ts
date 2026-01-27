import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject, Inject } from '@angular/core';

@Component({
  selector: 'app-confirm-action',
  standalone: false,
  templateUrl: './confirm-action.component.html',
  styleUrl: './confirm-action.component.css'
})
export class ConfirmActionComponent {
  // TODO MOVE TO SHARED AFTER PROCESS-COOLING IS MERGED
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