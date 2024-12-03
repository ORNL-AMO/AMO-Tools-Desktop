import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SurveyModalComponent } from './survey-modal/survey-modal.component';
import { SurveyModalService } from './survey-modal/survey-modal.service';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [SurveyModalComponent],
  imports: [
    CommonModule,
    ModalModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [
    SurveyModalComponent
  ],
  providers: [
    SurveyModalService
  ]
})
export class SurveyModalModule { }
