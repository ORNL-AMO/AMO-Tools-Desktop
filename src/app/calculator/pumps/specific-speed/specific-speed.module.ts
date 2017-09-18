import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SpecificSpeedGraphComponent } from './specific-speed-graph/specific-speed-graph.component';
import { SpecificSpeedFormComponent } from './specific-speed-form/specific-speed-form.component';
import { SpecificSpeedComponent } from './specific-speed.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    SpecificSpeedGraphComponent,
    SpecificSpeedComponent,
    SpecificSpeedFormComponent
  ],
  exports: [
    SpecificSpeedComponent
  ]
})
export class SpecificSpeedModule { }
