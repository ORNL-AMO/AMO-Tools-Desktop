import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SsmtComponent } from './ssmt.component';
import { SsmtBannerComponent } from './ssmt-banner/ssmt-banner.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [SsmtComponent, SsmtBannerComponent]
})
export class SsmtModule { }
