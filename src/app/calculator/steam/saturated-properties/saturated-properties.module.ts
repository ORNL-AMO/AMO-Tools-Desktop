import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SaturatedPropertiesGraphComponent } from './saturated-properties-graph/saturated-properties-graph.component';
import { SaturatedPropertiesComponent } from './saturated-properties.component';
import { SaturatedPropertiesFormComponent } from './saturated-properties-form/saturated-properties-form.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "../../../shared/shared.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    SaturatedPropertiesGraphComponent, SaturatedPropertiesComponent, SaturatedPropertiesFormComponent
  ],
  exports: [
    SaturatedPropertiesComponent
  ]
})
export class SaturatedPropertiesModule { }


