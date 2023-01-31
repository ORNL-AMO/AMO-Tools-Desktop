import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecurityAndPrivacyComponent } from './security-and-privacy.component';
import { SecurityAndPrivacyModalComponent } from './security-and-privacy-modal/security-and-privacy-modal.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SecurityAndPrivacyService } from './security-and-privacy.service';



@NgModule({
  declarations: [
    SecurityAndPrivacyComponent,
    SecurityAndPrivacyModalComponent
  ],
  imports: [
    CommonModule,
    ModalModule
  ],
  exports: [
    SecurityAndPrivacyComponent,
    SecurityAndPrivacyModalComponent
  ],
  providers: [
    SecurityAndPrivacyService
  ]
})
export class SecurityAndPrivacyModule { }
