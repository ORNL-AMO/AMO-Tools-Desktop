import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BannerTooltipsComponent } from './app-banner-tooltips.component';
import { SimpleTooltipModule } from '../simple-tooltip/simple-tooltip.module';


@NgModule({
  declarations: [BannerTooltipsComponent],
  imports: [
    CommonModule,
    SimpleTooltipModule
  ],
  exports: [
    BannerTooltipsComponent
  ]
//   providers: [] 2
})
export class BannerTooltipsModule { }