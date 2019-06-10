import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SaturatedPropertiesGraphComponent } from './saturated-properties-graph/saturated-properties-graph.component';
import { SaturatedPropertiesComponent } from './saturated-properties.component';
import { SaturatedPropertiesFormComponent } from './saturated-properties-form/saturated-properties-form.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "../../../shared/shared.module";
import { SaturatedPropertiesHelpComponent } from './saturated-properties-help/saturated-properties-help.component';
import { SaturatedPropertiesTableComponent } from './saturated-properties-table/saturated-properties-table.component';
import { SaturatedPropertiesPhGraphComponent } from './saturated-properties-ph-graph/saturated-properties-ph-graph.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    SaturatedPropertiesGraphComponent, SaturatedPropertiesComponent, SaturatedPropertiesFormComponent, SaturatedPropertiesHelpComponent, SaturatedPropertiesTableComponent, SaturatedPropertiesPhGraphComponent
  ],
  exports: [
    SaturatedPropertiesComponent
  ]
})
export class SaturatedPropertiesModule { }


