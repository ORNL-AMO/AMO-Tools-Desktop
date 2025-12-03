import { Dialog, DialogConfig, DialogRef } from '@angular/cdk/dialog';
import { ComponentType } from '@angular/cdk/portal';
import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';


/**
 * App global modal - render any component as a child of core.component
 * 
 * @remarks
 * Exposes observable to core.component, where it is rendered. 
 * Pass an injector ref with the target component if it needs service providers
 * 
 * @example
 * Close event in target component  :
 * ```typescript
 * import { DialogRef } from '@angular/cdk/dialog';
 * 
 *
 * private dialogRef = inject(DialogRef<AddModificationComponent>);
 *
 *  close() {
 *    this.dialogRef.close();
 *  }
 *
 * 
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ModalDialogService {
  private currentModalRef: BehaviorSubject<DialogRef<any, any> | null> = new BehaviorSubject<DialogRef<any, any> | null>(null);
  closedResult: Subject<any> = new Subject<any>();


  constructor(private dialog: Dialog) { }

  get modalDialogRef$() {
    return this.currentModalRef.asObservable();
  }

  /**
   * Opens modal at core.component 
   * @param injector - required if modal has services or other injections provided at the module level
   */
  openModal<T, D>(
    component: ComponentType<T>,
    config?: DialogConfig<D>,
    injector?: Injector
  ): DialogRef<T, any> {
    // todo we should use a default flexible width with override passed in

    const dialogRef = this.dialog.open<T, D>(component, {
      panelClass: 'app-modal-dialog',
      hasBackdrop: true,
      disableClose: false,
      injector: injector,
      ...config,
      data: config?.data
    });

    this.currentModalRef.next(dialogRef as DialogRef<any, any>);

    dialogRef.closed.subscribe((result) => {
      this.closedResult.next(result);
      if (this.currentModalRef.value === dialogRef) {
        this.currentModalRef.next(null);
      }
    });

    return dialogRef;
  }

}

