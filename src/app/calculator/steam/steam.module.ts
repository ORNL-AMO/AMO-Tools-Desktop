import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SteamPropertiesModule } from './steam-properties/steam-properties.module';
import { SteamComponent } from "./steam.component";
import { SteamService } from "./steam.service";


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
  ],
  providers: [
    SteamService
  ]
})
export class SteamModule { }
