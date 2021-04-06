import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpdateUnitsModalComponent } from './update-units-modal.component';
import { ModalModule } from 'ngx-bootstrap';



@NgModule({
  declarations: [
    UpdateUnitsModalComponent
  ],
  imports: [
    CommonModule,
    ModalModule
  ],
  exports: [
    UpdateUnitsModalComponent
  ]

})
export class UpdateUnitsModalModule { }
