import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserMessageOverlayComponent } from './user-message-overlay.component';



@NgModule({
  declarations: [UserMessageOverlayComponent],
  imports: [
    CommonModule
  ],
  exports: [
    UserMessageOverlayComponent
  ]
})
export class UserMessageOverlayModule { }
