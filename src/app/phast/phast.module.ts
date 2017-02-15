import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PhastComponent } from './phast.component';
import { PhastBannerComponent } from './phast-banner/phast-banner.component';

@NgModule({
  declarations: [
    PhastComponent,
    PhastBannerComponent,
  ],
  exports: [
  ],
  imports: [
    RouterModule
  ],
  providers: []
})

export class PhastModule { }
