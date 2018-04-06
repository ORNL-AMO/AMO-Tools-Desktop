import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SteamPropertiesModule } from './steam-properties/steam-properties.module';
import { SteamComponent } from "./steam.component";
import { SteamPropertiesComponent } from "./steam-properties/steam-properties.component";


@NgModule({
  imports: [
    CommonModule,
    SteamPropertiesModule
  ],
  declarations: [
    SteamComponent
  ],
  exports: [
    SteamComponent
  ]
})
export class SteamModule { }
