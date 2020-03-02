import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FsatSankeyComponent } from './fsat-sankey.component';



@NgModule({
  declarations: [FsatSankeyComponent],
  imports: [
    CommonModule
  ],
  exports: [
    FsatSankeyComponent
  ],
  providers: [
    DecimalPipe
  ]
})
export class FsatSankeyModule { }
