import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SpecificSpeedGraphComponent } from './specific-speed-graph/specific-speed-graph.component';
import { SpecificSpeedFormComponent } from './specific-speed-form/specific-speed-form.component';
import { SpecificSpeedComponent } from './specific-speed.component';
import { SpecificSpeedHelpComponent } from './specific-speed-help/specific-speed-help.component';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    SpecificSpeedGraphComponent,
    SpecificSpeedComponent,
    SpecificSpeedFormComponent,
    SpecificSpeedHelpComponent
  ],
  exports: [
    SpecificSpeedComponent
  ]
})
export class SpecificSpeedModule { }
