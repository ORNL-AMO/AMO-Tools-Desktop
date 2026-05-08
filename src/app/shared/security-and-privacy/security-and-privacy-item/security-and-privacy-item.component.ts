import { Component, inject, Inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
@Component({
    selector: 'app-security-and-privacy-item',
    templateUrl: './security-and-privacy-item.component.html',
    styleUrls: ['./security-and-privacy-item.component.css'],
    standalone: false
})
export class SecurityAndPrivacyItemComponent {
    dialogRef = inject<DialogRef<string>>(DialogRef);


    hidePrivacyModal() {
        this.dialogRef.close('false');
    }

}
