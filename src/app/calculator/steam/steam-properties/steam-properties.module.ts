import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SteamPropertiesGraphComponent } from './steam-properties-graph/steam-properties-graph.component';
import { SteamPropertiesComponent } from './steam-properties.component';
import { SteamPropertiesFormComponent } from './steam-properties-form/steam-properties-form.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "../../../shared/shared.module";
import { SteamPropertiesHelpComponent } from './steam-properties-help/steam-properties-help.component';
import { SteamPropertiesTableComponent } from './steam-properties-table/steam-properties-table.component';
import { SteamPropertiesPhGraphComponent } from './steam-properties-ph-graph/steam-properties-ph-graph.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    SteamPropertiesGraphComponent,
    SteamPropertiesComponent,
    SteamPropertiesFormComponent,
    SteamPropertiesHelpComponent,
    SteamPropertiesTableComponent,
    SteamPropertiesPhGraphComponent
  ],
  exports: [
    SteamPropertiesComponent
  ]
})
export class SteamPropertiesModule { }
