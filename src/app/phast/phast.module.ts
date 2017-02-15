import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PhastComponent } from './phast.component';
import { PhastBannerComponent } from './phast-banner/phast-banner.component';
import { SankeyComponent } from './sankey/sankey.component';
@NgModule({
  declarations: [
    PhastComponent,
    PhastBannerComponent,
    SankeyComponent
  ],
  exports: [
  ],
  imports: [
    RouterModule
  ],
  providers: []
})

export class PhastModule { }
