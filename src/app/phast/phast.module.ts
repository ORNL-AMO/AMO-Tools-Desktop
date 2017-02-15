import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PhastComponent } from './phast.component';
import { PhastBannerComponent } from './phast-banner/phast-banner.component';
import { SankeyComponent } from './sankey/sankey.component';
import { D3Service } from 'd3-ng2-service';

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
  providers: [D3Service]
})

export class PhastModule { }
