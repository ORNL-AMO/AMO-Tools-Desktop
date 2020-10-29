import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { PhastSankeyComponent } from './phast-sankey.component';



@NgModule({
  declarations: [PhastSankeyComponent],
  imports: [
    CommonModule,
  ],
  exports: [
    PhastSankeyComponent
  ],
  providers: [
    DecimalPipe
  ]
})
export class PhastSankeyModule { }
