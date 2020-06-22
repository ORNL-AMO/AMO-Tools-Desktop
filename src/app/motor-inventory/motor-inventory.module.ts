import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MotorInventoryComponent } from './motor-inventory.component';
import { MotorInventoryBannerComponent } from './motor-inventory-banner/motor-inventory-banner.component';
import { RouterModule } from '@angular/router';
import { MotorInventorySetupComponent } from './motor-inventory-setup/motor-inventory-setup.component';
import { MotorCatalogComponent } from './motor-catalog/motor-catalog.component';



@NgModule({
  declarations: [MotorInventoryComponent, MotorInventoryBannerComponent, MotorInventorySetupComponent, MotorCatalogComponent],
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class MotorInventoryModule { }
