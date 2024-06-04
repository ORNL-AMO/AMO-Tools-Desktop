import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorReportingComponent } from './error-reporting/error-reporting.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AppErrorService } from './app-error.service';
import { AppErrorModalComponent } from './app-error-modal/app-error-modal.component';



@NgModule({
  declarations: [
    ErrorReportingComponent,
    AppErrorModalComponent
  ],
  imports: [
    CommonModule,
    ModalModule
  ],
  exports: [
    AppErrorModalComponent,
    ErrorReportingComponent
  ],
  providers: [
    AppErrorService
  ]
})
export class AppErrorModule { }
