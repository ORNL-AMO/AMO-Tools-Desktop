import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { PhastSankeyComponent } from './phast-sankey.component';
import { InvalidPhastModule } from '../../phast/invalid-phast/invalid-phast.module';



@NgModule({
  declarations: [PhastSankeyComponent],
  imports: [
    CommonModule,
    InvalidPhastModule
  ],
  exports: [
    PhastSankeyComponent
  ],
  providers: [
    DecimalPipe
  ]
})
export class PhastSankeyModule { }
