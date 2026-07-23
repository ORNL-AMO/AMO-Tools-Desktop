import { Component, inject } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';

// * NOTE this component is a new security-and-privacy-item to be used with the angular cdk dialog and modal-dialog service as we move way from the bootstrap wrapper. it is essentially a copy of "security-and-privacy-modal"
// * dialogRef is optional so this component can also be rendered directly on the /privacy page, outside of a dialog
@Component({
    selector: 'app-security-and-privacy-item',
    templateUrl: './security-and-privacy-item.component.html',
    styleUrls: ['./security-and-privacy-item.component.css'],
    standalone: false
})
export class SecurityAndPrivacyItemComponent {
    dialogRef = inject<DialogRef<string>>(DialogRef, { optional: true });


    hidePrivacyModal() {
        this.dialogRef?.close();
    }

}
