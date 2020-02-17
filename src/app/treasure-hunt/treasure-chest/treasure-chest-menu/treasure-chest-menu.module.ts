import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreasureChestMenuComponent } from './treasure-chest-menu.component';
import { TreasureChestMenuService } from './treasure-chest-menu.service';

@NgModule({
  declarations: [
    TreasureChestMenuComponent
  ],
  imports: [
    CommonModule,
  ],
  providers: [
    TreasureChestMenuService
  ],
  exports: [
    TreasureChestMenuComponent
  ]
})
export class TreasureChestMenuModule { }
