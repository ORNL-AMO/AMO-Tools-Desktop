import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SteamPropertiesModule } from './steam-properties/steam-properties.module';
import { SteamComponent } from "./steam.component";


@NgModule({
  imports: [
    CommonModule,
    SteamPropertiesModule
  ],
  declarations: [
    SteamComponent
  ]
})
export class SteamModule { }
