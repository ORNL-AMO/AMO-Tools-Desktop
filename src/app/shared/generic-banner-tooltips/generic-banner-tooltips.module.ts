import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericBannerTooltipsComponent } from './generic-banner-tooltips.component';
import { SimpleTooltipModule } from '../simple-tooltip/simple-tooltip.module';


@NgModule({
  declarations: [GenericBannerTooltipsComponent],
  imports: [
    CommonModule,
    SimpleTooltipModule
  ],
  exports: [
    GenericBannerTooltipsComponent
  ]
//   providers: [] 2
})
export class GenericBannerTooltipsModule { }