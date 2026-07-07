import { Component, inject, Inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

// * NOTE this component is a new security-and-privacy-item to be used with the angular cdk dialog and modal-dialog service as we move way from the bootstrap wrapper. it is essentially a copy of "security-and-privacy-modal"
@Component({
    selector: 'app-security-and-privacy-item',
    templateUrl: './security-and-privacy-item.component.html',
    styleUrls: ['./security-and-privacy-item.component.css'],
    standalone: false
})
export class SecurityAndPrivacyItemComponent {
    dialogRef = inject<DialogRef<string>>(DialogRef);


    hidePrivacyModal() {
        this.dialogRef.close();
    }

}
