import { Component, inject, ViewEncapsulation } from '@angular/core';
import { DialogConfig, DialogRef } from '@angular/cdk/dialog';

// * encapsulation is disabled because the panelClass styles below must reach the cdk-overlay-pane, an ancestor of this component that emulated encapsulation cannot target
@Component({
    selector: 'app-security-and-privacy-item',
    templateUrl: './security-and-privacy-item.component.html',
    styleUrls: ['./security-and-privacy-item.component.css'],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class SecurityAndPrivacyItemComponent {
    dialogRef = inject<DialogRef<string>>(DialogRef, { optional: true });

    static getDialogConfig(): DialogConfig<undefined> {
        return { panelClass: ['app-modal-dialog', 'security-privacy-modal-dialog'] };
    }

    hidePrivacyModal() {
        this.dialogRef?.close();
    }

}
