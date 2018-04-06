import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SteamPropertiesGraphComponent } from './steam-properties-graph/steam-properties-graph.component';
import { SteamPropertiesComponent } from './steam-properties.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    SteamPropertiesGraphComponent,
    SteamPropertiesComponent
  ],
  exports: [
    SteamPropertiesComponent
  ]
})
export class SteamPropertiesModule { }
