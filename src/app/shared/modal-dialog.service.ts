import { Dialog, DialogConfig, DialogRef } from '@angular/cdk/dialog';
import { ComponentType } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalDialogService {
  private currentModalRef: BehaviorSubject<DialogRef<any, any>> = new BehaviorSubject(undefined);

  constructor(private dialog: Dialog) {}

  get modalDialogRef$() {
    return this.currentModalRef.asObservable();
  }


  openModal<T>(
    component: ComponentType<T>, 
    config?: DialogConfig<any>
  ) {
    const dialogRef = this.dialog.open(component, {
      panelClass: 'app-modal-dialog',
      hasBackdrop: true,
      disableClose: false,
      ...config
    });

    this.currentModalRef.next(dialogRef);

    dialogRef.closed.subscribe(() => {
      if (this.currentModalRef.value === dialogRef) {
        this.currentModalRef.next(undefined);
      }
    });
  }

}

  