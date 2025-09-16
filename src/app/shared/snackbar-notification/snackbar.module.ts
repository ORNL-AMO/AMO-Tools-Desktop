import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SnackbarNotificationComponent } from './snackbar-notification.component';
import { SnackbarService } from './snackbar.service';



@NgModule({
  declarations: [SnackbarNotificationComponent],
  imports: [
    CommonModule
  ],
  exports: [
    SnackbarNotificationComponent
  ],
  providers: [
    SnackbarService,
  ]
})
export class SnackbarModule { }
