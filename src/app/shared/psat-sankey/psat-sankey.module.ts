import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PsatSankeyComponent } from './psat-sankey.component';



@NgModule({
  declarations: [PsatSankeyComponent],
  imports: [
    CommonModule
  ],
  exports: [
    PsatSankeyComponent
  ]
})
export class PsatSankeyModule { }
