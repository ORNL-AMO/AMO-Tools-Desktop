import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcessCoolingListComponent } from './process-cooling-list/process-cooling-list.component';



@NgModule({
  declarations: [ProcessCoolingListComponent],
  imports: [
    CommonModule
  ],
  exports: [
    ProcessCoolingListComponent
  ]
})
export class ProcessCoolingModule { }
