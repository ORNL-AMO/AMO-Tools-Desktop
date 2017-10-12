import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OperationsFormComponent } from './operations-form/operations-form.component';
import { OperationsComponent } from './operations.component';
import { OperationsService } from './operations.service';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [OperationsFormComponent, OperationsComponent],
  providers: [OperationsService],
  exports: [OperationsComponent]
})
export class OperationsModule { }
