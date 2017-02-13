import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PsatComponent } from './psat.component';
import { PsatBannerComponent } from './psat-banner/psat-banner.component';

@NgModule({
  declarations: [
    PsatComponent,
    PsatBannerComponent
  ],
  exports: [
  ],
  imports: [
    RouterModule
  ],
  providers: []
})

export class PsatModule { }
