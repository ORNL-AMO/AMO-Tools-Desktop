import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PsatComponent } from './psat.component';
import { PsatBannerComponent } from './psat-banner/psat-banner.component';
import { PsatService } from './psat.service';
@NgModule({
  declarations: [
    PsatComponent,
    PsatBannerComponent
  ],
  exports: [

  ],
  imports: [
    RouterModule,
  ],
  providers: [
    PsatService
  ]
})

export class PsatModule { }
