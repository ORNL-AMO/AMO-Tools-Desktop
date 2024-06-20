import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateDiagramModalComponent } from './create-diagram-modal/create-diagram-modal.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';



@NgModule({
  declarations: [CreateDiagramModalComponent],
  imports: [
    CommonModule,
    ModalModule,
    ReactiveFormsModule
  ],
  exports: [CreateDiagramModalComponent]
})
export class CreateDiagramModalModule { }
