import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LossesTabsComponent } from './losses-tabs.component';
import { ChargeMaterialTabComponent } from './charge-material-tab/charge-material-tab.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [LossesTabsComponent, ChargeMaterialTabComponent],
  exports: [LossesTabsComponent]
})
export class LossesTabsModule { }
