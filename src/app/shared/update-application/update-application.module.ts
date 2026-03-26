import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpdateApplicationService } from './update-application.service';
import { ReleaseNotesModalComponent } from './release-notes-modal/release-notes-modal.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { UpdateApplicationToastComponent } from './update-application-toast/update-application-toast.component';
import { ClipboardModule } from '@angular/cdk/clipboard';


@NgModule({
  declarations: [
    UpdateApplicationToastComponent,
    ReleaseNotesModalComponent
  ],
  imports: [
    CommonModule,
    ModalModule,
    ClipboardModule
  ],
  exports: [
    ReleaseNotesModalComponent,
    UpdateApplicationToastComponent
  ],
  providers: [
    UpdateApplicationService
  ]
})
export class UpdateApplicationModule { }
