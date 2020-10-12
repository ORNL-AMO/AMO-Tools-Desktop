import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WasteWaterComponent } from './waste-water.component';
import { WasteWaterBannerComponent } from './waste-water-banner/waste-water-banner.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [WasteWaterComponent, WasteWaterBannerComponent],
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class WasteWaterModule { }
