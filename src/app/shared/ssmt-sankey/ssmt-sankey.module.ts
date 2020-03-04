import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { SsmtSankeyComponent } from './ssmt-sankey.component';



@NgModule({
  declarations: [SsmtSankeyComponent],
  imports: [
    CommonModule
  ],
  exports: [
    SsmtSankeyComponent
  ],
  providers: [
    DecimalPipe
  ]
})
export class SsmtSankeyModule { }
