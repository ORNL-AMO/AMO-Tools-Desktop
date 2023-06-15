import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateAssessmentModalComponent } from './create-assessment-modal.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';



@NgModule({
  declarations: [CreateAssessmentModalComponent],
  imports: [
    CommonModule,
    ModalModule,
    ReactiveFormsModule
  ],
  exports: [
    CreateAssessmentModalComponent
  ]
})
export class CreateAssessmentModalModule { }
