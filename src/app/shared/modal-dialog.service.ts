import { Dialog, DialogConfig, DialogRef } from '@angular/cdk/dialog';
import { ComponentType } from '@angular/cdk/portal';
import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


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
  private currentModalRef: BehaviorSubject<DialogRef<any, any> | null> = new BehaviorSubject(null);

  constructor(private dialog: Dialog) { }

  get modalDialogRef$() {
    return this.currentModalRef.asObservable();
  }

  /**
   * Opens modal at core.component 
   * @param injector - required if modal has services or other injections provided at the module level
   */
  openModal<T>(
    component: ComponentType<T>,
    config?: DialogConfig<any>,
    injector?: Injector
  ) {
    // todo we should use a default flexible width
    const dialogRef = this.dialog.open(component, {
      panelClass: 'app-modal-dialog',
      hasBackdrop: true,
      disableClose: false,
      injector: injector,
      ...config
    });

    this.currentModalRef.next(dialogRef);

    dialogRef.closed.subscribe(() => {
      if (this.currentModalRef.value === dialogRef) {
        this.currentModalRef.next(null);
      }
    });

    return dialogRef;
  }

}

