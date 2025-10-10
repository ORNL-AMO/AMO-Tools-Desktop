import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject, Inject } from '@angular/core';

@Component({
  selector: 'app-confirm-delete',
  standalone: false,
  templateUrl: './confirm-delete.component.html',
  styleUrl: './confirm-delete.component.css'
})
export class ConfirmDeleteComponent {
// TODO MOVE TO SHARED AFTER PROCESS-COOLING IS MERGED

  dialogRef = inject<DialogRef<string>>(DialogRef<string>);
  data: ConfirmDeleteData;
  
  constructor(@Inject(DIALOG_DATA) data: ConfirmDeleteData) {
    this.data = data;
  }

  close(shouldDelete: boolean) {
    if (shouldDelete) {
      this.dialogRef.close(this.data.deleteId);
    } else {
      this.dialogRef.close();
    }
  }
} 

export interface ConfirmDeleteData {
    modalTitle: string,
    confirmMessage: string,
    deleteId: string
}