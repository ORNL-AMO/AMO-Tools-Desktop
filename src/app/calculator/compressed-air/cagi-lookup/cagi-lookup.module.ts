import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CagiLookupComponent } from './cagi-lookup.component';
import { CagiLookupPlotComponent } from './cagi-lookup-plot/cagi-lookup-plot.component';
import { CagiLookupService } from './cagi-lookup.service';

@NgModule({
  declarations: [
    CagiLookupComponent,
    CagiLookupPlotComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    CagiLookupComponent
  ],
  providers: [
    CagiLookupService
  ]
})
export class CagiLookupModule { }
